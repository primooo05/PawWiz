// Feature: behavior-companion-chat — chat CRUD + ownership guard + behavior extraction
//
// Tests the service orchestration layer: ownership enforcement (AppError 404),
// message creation → behavior extraction delegation, and title auto-update logic.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { behaviorChatService } from '../behavior-chat.service.js';
import { AppError } from '../../utils/errors.js';

vi.mock('../../repositories/behavior-chat.repository.js', () => ({
  behaviorChatRepository: {
    findAllByUser: vi.fn(),
    findById: vi.fn(),
    belongsToUser: vi.fn(),
    createChat: vi.fn(),
    addMessage: vi.fn(),
    deleteChat: vi.fn(),
    updateTitle: vi.fn(),
  },
}));
vi.mock('../../repositories/behavior-log.repository.js', () => ({
  createBehaviorLog: vi.fn(),
}));
vi.mock('../../utils/winston.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { behaviorChatRepository } from '../../repositories/behavior-chat.repository.js';
import { createBehaviorLog } from '../../repositories/behavior-log.repository.js';

const repo = behaviorChatRepository as unknown as Record<string, ReturnType<typeof vi.fn>>;

beforeEach(() => vi.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// Ownership enforcement
// ─────────────────────────────────────────────────────────────────────────────
describe('BehaviorChatService — ownership guard', () => {
  it('getChat throws 404 when user does not own the chat', async () => {
    repo.belongsToUser.mockResolvedValueOnce(false);
    await expect(behaviorChatService.getChat('user-1', 'chat-99')).rejects.toThrow(AppError);
    await expect(behaviorChatService.getChat('user-1', 'chat-99')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('addMessage throws 404 when user does not own the chat', async () => {
    repo.belongsToUser.mockResolvedValueOnce(false);
    await expect(
      behaviorChatService.addMessage('user-1', { chatId: 'chat-99', speaker: 'user', text: 'hi' })
    ).rejects.toThrow(AppError);
  });

  it('deleteChat throws 404 when user does not own the chat', async () => {
    repo.belongsToUser.mockResolvedValueOnce(false);
    await expect(behaviorChatService.deleteChat('user-1', 'chat-99')).rejects.toThrow(AppError);
  });

  it('updateTitle throws 404 when user does not own the chat', async () => {
    repo.belongsToUser.mockResolvedValueOnce(false);
    await expect(behaviorChatService.updateTitle('user-1', 'chat-99', 'New Title')).rejects.toThrow(AppError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Chat creation
// ─────────────────────────────────────────────────────────────────────────────
describe('BehaviorChatService — createChat', () => {
  it('creates a chat and adds the Wiz welcome message', async () => {
    repo.createChat.mockResolvedValueOnce({ id: 'new-chat-id' });
    repo.findById.mockResolvedValueOnce({ id: 'new-chat-id', messages: [{ speaker: 'wiz', text: 'Hey there!' }] });

    const result = await behaviorChatService.createChat('user-1', 'My chat');

    expect(repo.createChat).toHaveBeenCalledWith({ supabaseUserId: 'user-1', catId: null, title: 'My chat' });
    expect(repo.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({ chatId: 'new-chat-id', speaker: 'wiz' })
    );
    expect(result).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Message addition + title auto-update
// ─────────────────────────────────────────────────────────────────────────────
describe('BehaviorChatService — addMessage', () => {
  it('succeeds when user owns the chat and persists the message', async () => {
    repo.belongsToUser.mockResolvedValueOnce(true);
    repo.addMessage.mockResolvedValueOnce({ id: 'msg-1', text: 'hello' });
    repo.findById.mockResolvedValueOnce({
      id: 'chat-1',
      messages: [{ speaker: 'user', text: 'hello' }],
    });

    const result = await behaviorChatService.addMessage('user-1', {
      chatId: 'chat-1',
      speaker: 'user',
      text: 'hello',
    });

    expect(result).toEqual({ id: 'msg-1', text: 'hello' });
    expect(repo.addMessage).toHaveBeenCalledTimes(1);
  });

  it('auto-updates title from the FIRST user message only', async () => {
    // First user message → title update
    repo.belongsToUser.mockResolvedValueOnce(true);
    repo.addMessage.mockResolvedValueOnce({ id: 'msg-1' });
    repo.findById.mockResolvedValueOnce({
      id: 'chat-1',
      messages: [{ speaker: 'user', text: 'cat keeps hissing at the dog' }],
    });

    await behaviorChatService.addMessage('user-1', {
      chatId: 'chat-1',
      speaker: 'user',
      text: 'cat keeps hissing at the dog',
    });

    expect(repo.updateTitle).toHaveBeenCalledTimes(1);
  });

  it('does NOT auto-update title for wiz messages', async () => {
    repo.belongsToUser.mockResolvedValueOnce(true);
    repo.addMessage.mockResolvedValueOnce({ id: 'msg-2' });
    repo.findById.mockResolvedValueOnce({
      id: 'chat-1',
      messages: [{ speaker: 'wiz', text: 'Some analysis' }],
    });

    await behaviorChatService.addMessage('user-1', {
      chatId: 'chat-1',
      speaker: 'wiz',
      text: 'Some analysis',
    });

    expect(repo.updateTitle).not.toHaveBeenCalled();
  });

  it('does NOT update title after the second user message', async () => {
    repo.belongsToUser.mockResolvedValueOnce(true);
    repo.addMessage.mockResolvedValueOnce({ id: 'msg-3' });
    repo.findById.mockResolvedValueOnce({
      id: 'chat-1',
      messages: [
        { speaker: 'user', text: 'first message' },
        { speaker: 'user', text: 'second message' },
      ],
    });

    await behaviorChatService.addMessage('user-1', {
      chatId: 'chat-1',
      speaker: 'user',
      text: 'second message',
    });

    expect(repo.updateTitle).not.toHaveBeenCalled();
  });
});
