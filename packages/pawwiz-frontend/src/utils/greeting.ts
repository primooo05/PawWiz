export interface GreetingCopy {
    title: string;
    subtitle: string;
}

export interface GreetingTemplates {
    morning: (owner: string, cat: string) => GreetingCopy;
    midday: (owner: string, cat: string) => GreetingCopy;
    evening: (owner: string, cat: string) => GreetingCopy;
    night: (owner: string, cat: string) => GreetingCopy;
}

/**
 * Resolves a time-of-day appropriate greeting from a set of module-specific
 * templates. Shared across dashboard, behavior chat, diet recommender, and
 * pregnancy tracker so each module can keep its own copy while reusing the
 * same time-slicing logic.
 */
export function getTimeGreeting(
    templates: GreetingTemplates,
    ownerName?: string,
    catName?: string
): GreetingCopy {
    const owner = ownerName || 'Parent';
    const cat = catName || 'your cat';
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 11) return templates.morning(owner, cat);
    if (hour >= 11 && hour < 17) return templates.midday(owner, cat);
    if (hour >= 17 && hour < 22) return templates.evening(owner, cat);
    return templates.night(owner, cat);
}
