/**
 * ASPCA Plants Non-Toxic to Cats — reformatted from safe-plants-cats.csv
 *
 * Source: ASPCA Animal Poison Control Center
 * All entries have toxicityStatus: 'safe', severity: null, clinicalSigns: [].
 *
 * 306 unique records, deduplicated by scientific name (first common name per species retained).
 */

import { type PlantToxicityRecord } from '../types/shared.js';

export const ASPCA_SAFE_PLANTS: Record<string, PlantToxicityRecord> = {
  "acorn squash": {
    plantName: 'Acorn Squash',
    scientificName: 'Cucurbita pepo',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Acorn Squash is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Cucurbita_pepo_collage_1.png/500px-Cucurbita_pepo_collage_1.png"
  },
  "african daisy": {
    plantName: 'African Daisy',
    scientificName: 'Gerbera jamesonii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'African Daisy is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Gerbera_jamesonii_%28Asteraceae%29.jpg/500px-Gerbera_jamesonii_%28Asteraceae%29.jpg"
  },
  "african violet": {
    plantName: 'African Violet',
    scientificName: 'Saintpaulia spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'African Violet is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Saintpaulia_ionantha.jpg/500px-Saintpaulia_ionantha.jpg"
  },
  "algaroba": {
    plantName: 'Algaroba',
    scientificName: 'Prosopis limensis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Algaroba is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Starr_050924-4469_Prosopis_pallida.jpg/500px-Starr_050924-4469_Prosopis_pallida.jpg"
  },
  "aluminum plant": {
    plantName: 'Aluminum Plant',
    scientificName: 'Pilea cadieri',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Aluminum Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/PileaCadierei.jpg/500px-PileaCadierei.jpg"
  },
  "alumroot": {
    plantName: 'Alumroot',
    scientificName: 'Heuchera sanguinea',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Alumroot is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/%C5%BBurawka.jpg/500px-%C5%BBurawka.jpg"
  },
  "alyssum": {
    plantName: 'Alyssum',
    scientificName: 'Alyssum spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Alyssum is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Alyssum_montanum_ENBLA06.jpg/500px-Alyssum_montanum_ENBLA06.jpg"
  },
  "american rubber plant": {
    plantName: 'American Rubber Plant',
    scientificName: 'Peperomia obtusifolia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'American Rubber Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Peperomia_obtusifolia_3-OB9.jpg/500px-Peperomia_obtusifolia_3-OB9.jpg"
  },
  "amur maple": {
    plantName: 'Amur Maple',
    scientificName: 'Acer ginnala',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Amur Maple is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Acer_ginnala%2C_Amur_River%2C_Khabarovsky_District%2C_Khabarovsk_Krai%2C_Russia_1.jpg/500px-Acer_ginnala%2C_Amur_River%2C_Khabarovsky_District%2C_Khabarovsk_Krai%2C_Russia_1.jpg"
  },
  "anthericum comosum": {
    plantName: 'Anthericum Comosum',
    scientificName: 'Chlorophytum comosum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Anthericum Comosum is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Hierbabuena_0611_Revised.jpg/500px-Hierbabuena_0611_Revised.jpg"
  },
  "antirrhinum multiflorum": {
    plantName: 'Antirrhinum Multiflorum',
    scientificName: 'Antirrhinum multiflorum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Antirrhinum Multiflorum is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Antirrhinummultiflorum.jpg"
  },
  "arabian gentian": {
    plantName: 'Arabian Gentian',
    scientificName: 'Exacum affine',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Arabian Gentian is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Flower-010.jpg/500px-Flower-010.jpg"
  },
  "areca palm": {
    plantName: 'Areca Palm',
    scientificName: 'Dypsis lutescens',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Areca Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/%E6%95%A3%E5%B0%BE%E8%91%B5Dypsis_lutescens_20210511145013_05.jpg/500px-%E6%95%A3%E5%B0%BE%E8%91%B5Dypsis_lutescens_20210511145013_05.jpg"
  },
  "aregelia": {
    plantName: 'Aregelia',
    scientificName: 'Neoregalia spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Aregelia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Nidularium_fulgens_HabitusInflorescence_BotGardBln090f6.JPG/500px-Nidularium_fulgens_HabitusInflorescence_BotGardBln090f6.JPG"
  },
  "artillery plant": {
    plantName: 'Artillery Plant',
    scientificName: 'Pilea microphylla',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Artillery Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Starr_030807-0140_Pilea_microphylla.jpg/500px-Starr_030807-0140_Pilea_microphylla.jpg"
  },
  "aspidium falcatum": {
    plantName: 'Aspidium falcatum',
    scientificName: 'Cyrtomium falcatum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Aspidium falcatum is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Cyrtomium_falcatum_3.jpg/500px-Cyrtomium_falcatum_3.jpg"
  },
  "australian pine": {
    plantName: 'Australian Pine',
    scientificName: 'Araucaria heterophylla',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Australian Pine is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Norfolk-Island-Pines.jpg/500px-Norfolk-Island-Pines.jpg"
  },
  "autumn olive": {
    plantName: 'Autumn Olive',
    scientificName: 'Eleagnus spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Autumn Olive is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Elaeagnus_commutata_USDA.jpg/500px-Elaeagnus_commutata_USDA.jpg"
  },
  "bachelors buttons": {
    plantName: 'Bachelors Buttons',
    scientificName: 'Centaurea cyanus',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Bachelors Buttons is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Centaurea_cyanus_flower_001.jpg/500px-Centaurea_cyanus_flower_001.jpg"
  },
  "ball fern": {
    plantName: 'Ball Fern',
    scientificName: 'Davallia spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Ball Fern is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Davallia_canariensis_cult0.jpg/500px-Davallia_canariensis_cult0.jpg"
  },
  "bamboo": {
    plantName: 'Bamboo',
    scientificName: 'Phyllostachys aurea',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Bamboo is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Phyllostachys_aurea0.jpg/500px-Phyllostachys_aurea0.jpg"
  },
  "bamboo palm": {
    plantName: 'Bamboo Palm',
    scientificName: 'Chamaedorea elegans',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Bamboo Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Chamaedorea_elegans_Mart.JPG/500px-Chamaedorea_elegans_Mart.JPG"
  },
  "bamboo vine": {
    plantName: 'Bamboo Vine',
    scientificName: 'Smilax laurifolia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Bamboo Vine is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Smilax_laurifolia_%282020%29.jpg/500px-Smilax_laurifolia_%282020%29.jpg"
  },
  "banana": {
    plantName: 'Banana',
    scientificName: 'Musa acuminata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Banana is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Musa_acuminata_in_india01.jpg/500px-Musa_acuminata_in_india01.jpg"
  },
  "banana squash": {
    plantName: 'Banana Squash',
    scientificName: 'Cucurbita maxima var. banana',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Banana Squash is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cucurbita_maxima_Blanco2.320.png/500px-Cucurbita_maxima_Blanco2.320.png"
  },
  "basil": {
    plantName: 'Basil',
    scientificName: 'Ocimum basilicum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Basil is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Ocimum_basilicum_8zz.jpg/500px-Ocimum_basilicum_8zz.jpg"
  },
  "beets": {
    plantName: 'Beets',
    scientificName: 'Beta vulgaris',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Beets is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Beta_vulgaris_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-167.jpg"
  },
  "begonia climbing": {
    plantName: 'Begonia Climbing',
    scientificName: 'Cissus dicolor',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Begonia Climbing is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Begonia_maculata3073316230.jpg/500px-Begonia_maculata3073316230.jpg"
  },
  "begonia trailing": {
    plantName: 'Begonia Trailing',
    scientificName: 'Pellionia daveauana',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Begonia Trailing is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Pellionia_repens_kz7.jpg/500px-Pellionia_repens_kz7.jpg"
  },
  "belmore sentry palm": {
    plantName: 'Belmore Sentry Palm',
    scientificName: 'Howea belmoreana',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Belmore Sentry Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Howea-belmoreana.jpg/500px-Howea-belmoreana.jpg"
  },
  "big shagbark hickory": {
    plantName: 'Big Shagbark Hickory',
    scientificName: 'Carya laciniosa',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Big Shagbark Hickory is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Carya_laciniosa-_Virginia.jpg/500px-Carya_laciniosa-_Virginia.jpg"
  },
  "bitter pecan": {
    plantName: 'Bitter Pecan',
    scientificName: 'Carya aquatica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Bitter Pecan is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Carya_aquatica_USDA.jpg/500px-Carya_aquatica_USDA.jpg"
  },
  "bitternut": {
    plantName: 'Bitternut',
    scientificName: 'Carya cordiformis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Bitternut is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Carya_cordiformis.jpg/500px-Carya_cordiformis.jpg"
  },
  "black haw": {
    plantName: 'Black Haw',
    scientificName: 'Viburnum lentago',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Black Haw is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Viburnum_lentago_NRCS-006.jpg/500px-Viburnum_lentago_NRCS-006.jpg"
  },
  "black hawthorn": {
    plantName: 'Black Hawthorn',
    scientificName: 'Crataegus douglasii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Black Hawthorn is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Crataegus_douglasii.jpg/500px-Crataegus_douglasii.jpg"
  },
  "black walnut": {
    plantName: 'Black Walnut',
    scientificName: 'Juglans nigra',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Black Walnut is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Black_Walnut_nut_and_leave_detail.JPG/500px-Black_Walnut_nut_and_leave_detail.JPG"
  },
  "bloodleaf": {
    plantName: 'Bloodleaf',
    scientificName: 'Iresine herbstii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Bloodleaf is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/IresineHerbstii.jpg/500px-IresineHerbstii.jpg"
  },
  "blooming sally": {
    plantName: 'Blooming Sally',
    scientificName: 'Epilobium angustifolium',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Blooming Sally is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Maitohorsma_%28Epilobium_angustifolium%29.JPG/500px-Maitohorsma_%28Epilobium_angustifolium%29.JPG"
  },
  "blue bead": {
    plantName: 'Blue Bead',
    scientificName: 'Clintonia borealis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Blue Bead is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Clintonia_borealis_140615.jpg/500px-Clintonia_borealis_140615.jpg"
  },
  "blue daisy": {
    plantName: 'Blue Daisy',
    scientificName: 'Felicia amelloides',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Blue Daisy is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Felicia_amelloides01.jpg/500px-Felicia_amelloides01.jpg"
  },
  "blue echeveria": {
    plantName: 'Blue Echeveria',
    scientificName: 'Echeveria glauca',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Blue Echeveria is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Echeveria_elegans_-_1.jpg/500px-Echeveria_elegans_-_1.jpg"
  },
  "blue eyed daisy": {
    plantName: 'Blue Eyed Daisy',
    scientificName: 'Arctotis stoechadifolia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Blue Eyed Daisy is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Arctotis_stoechadifolia_P._J._Bergius%2C_Fr%C3%BChlingsbl%C3%BCte_West_Coast_N.P._P1030626.JPG/500px-Arctotis_stoechadifolia_P._J._Bergius%2C_Fr%C3%BChlingsbl%C3%BCte_West_Coast_N.P._P1030626.JPG"
  },
  "blue-dicks": {
    plantName: 'Blue-dicks',
    scientificName: 'Dichelostemma pulchellum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Blue-dicks is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/D_congestum.jpg/500px-D_congestum.jpg"
  },
  "bold sword fern": {
    plantName: 'Bold Sword Fern',
    scientificName: 'Nephrolepis biserrata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Bold Sword Fern is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Nephrolepis_biserrata_-_Botanischer_Garten_M%C3%BCnchen-Nymphenburg_-_DSC08168.JPG/500px-Nephrolepis_biserrata_-_Botanischer_Garten_M%C3%BCnchen-Nymphenburg_-_DSC08168.JPG"
  },
  "boston fern": {
    plantName: 'Boston Fern',
    scientificName: 'Nephrolepis exalta bostoniensis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Boston Fern is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Boston_Fern_%282873392811%29.png/500px-Boston_Fern_%282873392811%29.png"
  },
  "bottle palm": {
    plantName: 'Bottle Palm',
    scientificName: 'Beaucarnea recurvata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Bottle Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Beaucarnea_recurvata%2C_Ocampo%2C_Tamaulipas%2C_Mexico_1.jpg/500px-Beaucarnea_recurvata%2C_Ocampo%2C_Tamaulipas%2C_Mexico_1.jpg"
  },
  "bottlebrush": {
    plantName: 'Bottlebrush',
    scientificName: 'Callistemon species',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Bottlebrush is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Red_bottle_brush.jpg/500px-Red_bottle_brush.jpg"
  },
  "brazilian orchid": {
    plantName: 'Brazilian Orchid',
    scientificName: 'Sophronitis spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Brazilian Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Cattleya_labiata_Orchi_1013.jpg/500px-Cattleya_labiata_Orchi_1013.jpg"
  },
  "bristly greenbrier": {
    plantName: 'Bristly Greenbrier',
    scientificName: 'Smilax hispida',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Bristly Greenbrier is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Smilax_tamnoides_2009-05-24_01.jpg/500px-Smilax_tamnoides_2009-05-24_01.jpg"
  },
  "bullbrier": {
    plantName: 'Bullbrier',
    scientificName: 'Smilax rotundifolia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Bullbrier is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Smilax_rotundifolia_8.JPG/500px-Smilax_rotundifolia_8.JPG"
  },
  "bur gourd": {
    plantName: 'Bur Gourd',
    scientificName: 'Cucumis anguria',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Bur Gourd is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cucumis_anguria.JPG/500px-Cucumis_anguria.JPG"
  },
  "buttercup squash": {
    plantName: 'Buttercup Squash',
    scientificName: 'Cucurbita maxima cv buttercup',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Buttercup Squash is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cucurbita_maxima_Blanco2.320.png/500px-Cucurbita_maxima_Blanco2.320.png"
  },
  "butterfly ginger": {
    plantName: 'Butterfly Ginger',
    scientificName: 'Hedychium coronarium',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Butterfly Ginger is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Zingiberaceae_Hedychium_coronarium_1.2.jpg/500px-Zingiberaceae_Hedychium_coronarium_1.2.jpg"
  },
  "butternut squash": {
    plantName: 'Butternut Squash',
    scientificName: 'Cucurbita maxima cv butternut',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Butternut Squash is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Cucurbita_moschata_Butternut_2012_G2.jpg/500px-Cucurbita_moschata_Butternut_2012_G2.jpg"
  },
  "buzzy lizzie": {
    plantName: 'Buzzy Lizzie',
    scientificName: 'Impatiens spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Buzzy Lizzie is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Impatiens_scapiflora.jpg/500px-Impatiens_scapiflora.jpg"
  },
  "caeroba": {
    plantName: 'Caeroba',
    scientificName: 'Calathea insignis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Caeroba is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/CalatheaLancifolia.jpg/500px-CalatheaLancifolia.jpg"
  },
  "california pitcher plant": {
    plantName: 'California Pitcher Plant',
    scientificName: 'Darlingtonia californica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'California Pitcher Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Darlingtonia_californica_ne1.JPG/500px-Darlingtonia_californica_ne1.JPG"
  },
  "callistemon citrinus": {
    plantName: 'Callistemon citrinus',
    scientificName: 'Callistemon citrinus',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Callistemon citrinus is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Callistemon_citrinus-0878.jpg/500px-Callistemon_citrinus-0878.jpg"
  },
  "callistemon viminalis": {
    plantName: 'Callistemon viminalis',
    scientificName: 'Callistemon viminalis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Callistemon viminalis is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Melaleuca_viminalis.jpg/500px-Melaleuca_viminalis.jpg"
  },
  "calochortus nuttalli": {
    plantName: 'Calochortus nuttalli',
    scientificName: 'Calochortus spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Calochortus nuttalli is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Sego_lily_cm.jpg/500px-Sego_lily_cm.jpg"
  },
  "camellia": {
    plantName: 'Camellia',
    scientificName: 'Camellia japonica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Camellia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Camellia_japonica_NBG.jpg/500px-Camellia_japonica_NBG.jpg"
  },
  "canada hemlock": {
    plantName: 'Canada Hemlock',
    scientificName: 'Tsuga canadensis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Canada Hemlock is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/2/24/Tsuga_canadensis_morton.jpg"
  },
  "canary date palm": {
    plantName: 'Canary Date Palm',
    scientificName: 'Phoenix canariensis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Canary Date Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Phoenix_canariensis_%28Puntallana%29_01.jpg/500px-Phoenix_canariensis_%28Puntallana%29_01.jpg"
  },
  "candle plant": {
    plantName: 'Candle Plant',
    scientificName: 'Plectranthus coleoides',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Candle Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Plectranthus_madagascariensis_kz1.JPG/500px-Plectranthus_madagascariensis_kz1.JPG"
  },
  "candycorn plant": {
    plantName: 'Candycorn Plant',
    scientificName: 'Hypocyrta nummularia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Candycorn Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Moullava_spicata%2C_Dandeli.jpg/500px-Moullava_spicata%2C_Dandeli.jpg"
  },
  "canna": {
    plantName: 'Canna',
    scientificName: 'Canna indica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Canna is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Cinnamon-bellied_flowerpiercer_%28Diglossa_baritula%29_male_on_Indian_shot_%28Canna_indica%29_Finca_El_Pilar.jpg/500px-Cinnamon-bellied_flowerpiercer_%28Diglossa_baritula%29_male_on_Indian_shot_%28Canna_indica%29_Finca_El_Pilar.jpg"
  },
  "canna lily": {
    plantName: 'Canna Lily',
    scientificName: 'Canna generalis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Canna Lily is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Canna_sp.jpg/500px-Canna_sp.jpg"
  },
  "canterbury-bell": {
    plantName: 'Canterbury-bell',
    scientificName: 'Gloxinia perennis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Canterbury-bell is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Gesneriaceae_-_Gloxinia_perennis..jpg/500px-Gesneriaceae_-_Gloxinia_perennis..jpg"
  },
  "cape marigold": {
    plantName: 'Cape Marigold',
    scientificName: 'Dimorphotheca pluvialis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cape Marigold is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Dimorphotheca_pluvialis_flowers.jpg/500px-Dimorphotheca_pluvialis_flowers.jpg"
  },
  "cape primrose": {
    plantName: 'Cape Primrose',
    scientificName: 'Streptocarpus spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cape Primrose is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/2007-03-20Streptocarpus03.jpg/500px-2007-03-20Streptocarpus03.jpg"
  },
  "carob": {
    plantName: 'Carob',
    scientificName: 'Ceratonia siliqua',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Carob is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Ceratonia_siliqua_Keciboynuzu_1370984_Nevit.jpg/500px-Ceratonia_siliqua_Keciboynuzu_1370984_Nevit.jpg"
  },
  "caroba": {
    plantName: 'Caroba',
    scientificName: 'Jacaranda procera',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Caroba is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Tahr_Devils_Peak_2004.jpg"
  },
  "carolina hemlock": {
    plantName: 'Carolina Hemlock',
    scientificName: 'Tsuga caroliniana',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Carolina Hemlock is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Tsuga_caroliniana_Rog%C3%B3w.jpg/500px-Tsuga_caroliniana_Rog%C3%B3w.jpg"
  },
  "carrion flower": {
    plantName: 'Carrion Flower',
    scientificName: 'Smilax herbacea',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Carrion Flower is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Smilax_herbacea_Tennessee.jpg/500px-Smilax_herbacea_Tennessee.jpg"
  },
  "carrion flower 2": {
    plantName: 'Carrion Flower 2',
    scientificName: 'Stapelia hirsata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Carrion Flower 2 is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/WedgetailEagleCarrion.jpg/500px-WedgetailEagleCarrion.jpg"
  },
  "carrot fern": {
    plantName: 'Carrot Fern',
    scientificName: 'Onychium japonica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Carrot Fern is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Onychium_japonicum_Tatisinobu.jpg/500px-Onychium_japonicum_Tatisinobu.jpg"
  },
  "carrot flower": {
    plantName: 'Carrot Flower',
    scientificName: 'Daucus carota var. sativa',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Carrot Flower is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Daucus_carota_May_2008-1_edit.jpg/500px-Daucus_carota_May_2008-1_edit.jpg"
  },
  "casaba melon": {
    plantName: 'Casaba Melon',
    scientificName: 'Cucumis melo',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Casaba Melon is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Muskmelon.jpg/500px-Muskmelon.jpg"
  },
  "cast iron plant": {
    plantName: 'Cast Iron Plant',
    scientificName: 'Aspidistra elatior',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cast Iron Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Aspidistra_elatior1.jpg/500px-Aspidistra_elatior1.jpg"
  },
  "cattleya labiata": {
    plantName: 'Cattleya Labiata',
    scientificName: 'Cattleya labiata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cattleya Labiata is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Labiata.jpg/500px-Labiata.jpg"
  },
  "celosia globosa": {
    plantName: 'Celosia Globosa',
    scientificName: 'Celosia globosa',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Celosia Globosa is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Spring_bedding%2C_South_Shields_-_geograph.org.uk_-_406077.jpg/500px-Spring_bedding%2C_South_Shields_-_geograph.org.uk_-_406077.jpg"
  },
  "celosia plumosa": {
    plantName: 'Celosia Plumosa',
    scientificName: 'Celosia plumosa',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Celosia Plumosa is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Celosia_argentea_flowering_q1.jpg/500px-Celosia_argentea_flowering_q1.jpg"
  },
  "celosia spicata": {
    plantName: 'Celosia Spicata',
    scientificName: 'Celosia spicata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Celosia Spicata is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Celosia_spicata.jpg/500px-Celosia_spicata.jpg"
  },
  "chaparral": {
    plantName: 'Chaparral',
    scientificName: 'Larrea tridentata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Chaparral is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Larrea_tridentata_Furnace_Creek.jpg/500px-Larrea_tridentata_Furnace_Creek.jpg"
  },
  "chervil": {
    plantName: 'Chervil',
    scientificName: 'Anthriscus cerefolium',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Chervil is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Illustration_Anthriscus_cerefolium0.jpg/500px-Illustration_Anthriscus_cerefolium0.jpg"
  },
  "chestnut": {
    plantName: 'Chestnut',
    scientificName: 'Castanea dentata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Chestnut is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/American_Chestnut.JPG/500px-American_Chestnut.JPG"
  },
  "chickens and hens": {
    plantName: 'Chickens and Hens',
    scientificName: 'Echeveria elegans',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Chickens and Hens is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Echeveria_elegans_-_1.png/500px-Echeveria_elegans_-_1.png"
  },
  "china aster": {
    plantName: 'China Aster',
    scientificName: 'Callistephus chinensis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'China Aster is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Asterales_-_Callistephus_chinensis_-_20120823.jpg/500px-Asterales_-_Callistephus_chinensis_-_20120823.jpg"
  },
  "chinese plumbago": {
    plantName: 'Chinese Plumbago',
    scientificName: 'Ceratostigma willmottianum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Chinese Plumbago is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Ceratostigma_willmottianum_kz1.jpg/500px-Ceratostigma_willmottianum_kz1.jpg"
  },
  "chlorophytum bichetti": {
    plantName: 'Chlorophytum bichetti',
    scientificName: 'Chlorophytum bichetti',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Chlorophytum bichetti is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: null
  },
  "chocolate soldier": {
    plantName: 'Chocolate Soldier',
    scientificName: 'Episcia dianthiflora',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Chocolate Soldier is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Episcia_dianthiflora_kz4.jpg/500px-Episcia_dianthiflora_kz4.jpg"
  },
  "christmas cactus": {
    plantName: 'Christmas Cactus',
    scientificName: 'Schlumbergera bridgesii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Christmas Cactus is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Cactus_de_no%C3%ABl_rev.jpg/500px-Cactus_de_no%C3%ABl_rev.jpg"
  },
  "christmas dagger": {
    plantName: 'Christmas Dagger',
    scientificName: 'Polystichum acrostichoides',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Christmas Dagger is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Christmas_fern.jpg/500px-Christmas_fern.jpg"
  },
  "christmas orchid": {
    plantName: 'Christmas Orchid',
    scientificName: 'Cattleya trianaei',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Christmas Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Orangeries_de_Bierbais.jpg/500px-Orangeries_de_Bierbais.jpg"
  },
  "christmas palm": {
    plantName: 'Christmas Palm',
    scientificName: 'Adonidia merrillii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Christmas Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Adonidia_merrillii_Vi%C3%B1ales_Cuba_3.jpg/500px-Adonidia_merrillii_Vi%C3%B1ales_Cuba_3.jpg"
  },
  "cilantro": {
    plantName: 'Cilantro',
    scientificName: 'Coriandrum sativum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cilantro is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/1/13/Coriandrum_sativum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-193.jpg"
  },
  "cinnamon": {
    plantName: 'Cinnamon',
    scientificName: 'Cinnamomum zeylanicum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cinnamon is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Cinnamomum_verum1.jpg"
  },
  "cinquefoil": {
    plantName: 'Cinquefoil',
    scientificName: 'Potentilla spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cinquefoil is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Potentilla_reptans_beauvais-carriere-bracheux_60_20062008_1.jpg/500px-Potentilla_reptans_beauvais-carriere-bracheux_60_20062008_1.jpg"
  },
  "cirrhopetalum": {
    plantName: 'Cirrhopetalum',
    scientificName: 'Bulbophyllum appendiculatum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cirrhopetalum is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Bulbophyllum_umbellatum_-_Edwards_vol_31_%28NS_8%29_pl_44_%281845%29.jpg/500px-Bulbophyllum_umbellatum_-_Edwards_vol_31_%28NS_8%29_pl_44_%281845%29.jpg"
  },
  "clearweed": {
    plantName: 'Clearweed',
    scientificName: 'Pilea pumila',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Clearweed is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Pilea_pumila_FdS2025.jpg/500px-Pilea_pumila_FdS2025.jpg"
  },
  "cliff brake": {
    plantName: 'Cliff Brake',
    scientificName: 'Pellaea rotundifolia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cliff Brake is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Pellaea_rotundifolia_-_Berlin_Botanical_Garden_-_IMG_8761.JPG/500px-Pellaea_rotundifolia_-_Berlin_Botanical_Garden_-_IMG_8761.JPG"
  },
  "club moss": {
    plantName: 'Club Moss',
    scientificName: 'Selaginella kraussiana',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Club Moss is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/SelaginellaKraussiana.jpg/500px-SelaginellaKraussiana.jpg"
  },
  "cocks comb": {
    plantName: 'Cocks Comb',
    scientificName: 'Amaranthus hypochondriacus',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cocks Comb is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/%28MHNT%29_Amaranthus_hypochondriacus_-_Mature_inflorescence_-_Les_Martels%2C_Giroussens_Tarn.jpg/500px-%28MHNT%29_Amaranthus_hypochondriacus_-_Mature_inflorescence_-_Les_Martels%2C_Giroussens_Tarn.jpg"
  },
  "cocktail orchid": {
    plantName: 'Cocktail Orchid',
    scientificName: 'Cattleya forbesii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cocktail Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Orchid-004.jpg/500px-Orchid-004.jpg"
  },
  "common snapdragon": {
    plantName: 'Common Snapdragon',
    scientificName: 'Antirrhinum majus',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Common Snapdragon is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Antirrhinum_majus_BCBG_%2802%29.jpg/500px-Antirrhinum_majus_BCBG_%2802%29.jpg"
  },
  "common staghorn fern": {
    plantName: 'Common Staghorn Fern',
    scientificName: 'Platycerium bifurcatum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Common Staghorn Fern is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Platycerium_bifurcatum_kz01.jpg/500px-Platycerium_bifurcatum_kz01.jpg"
  },
  "confederate jasmine": {
    plantName: 'Confederate Jasmine',
    scientificName: 'Trachelospermum jasminoides',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Confederate Jasmine is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Trachelospermum_jasminoides1215878198.jpg/500px-Trachelospermum_jasminoides1215878198.jpg"
  },
  "copper rose": {
    plantName: 'Copper Rose',
    scientificName: 'Echeveria multicaulis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Copper Rose is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Echeveria_multicaulis_1.jpg/500px-Echeveria_multicaulis_1.jpg"
  },
  "coreopsis": {
    plantName: 'Coreopsis',
    scientificName: 'Coreopsis spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Coreopsis is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Coreopsisgigantea.jpg/500px-Coreopsisgigantea.jpg"
  },
  "crape myrtle": {
    plantName: 'Crape Myrtle',
    scientificName: 'Lagerstroemia indica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Crape Myrtle is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Extremosa_%28Lagerstroemia_indica%29_em_um_fim_de_tarde_em_Bag%C3%A9-RS_-_55013179934.jpg/500px-Extremosa_%28Lagerstroemia_indica%29_em_um_fim_de_tarde_em_Bag%C3%A9-RS_-_55013179934.jpg"
  },
  "creeping charlie": {
    plantName: 'Creeping Charlie',
    scientificName: 'Pilea nummulariifolia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Creeping Charlie is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Dinheirinho.jpg/500px-Dinheirinho.jpg"
  },
  "creeping gloxinia": {
    plantName: 'Creeping Gloxinia',
    scientificName: 'Asarina erubescens',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Creeping Gloxinia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Asarina1.jpg/500px-Asarina1.jpg"
  },
  "creeping rubus": {
    plantName: 'Creeping Rubus',
    scientificName: 'Rubus pedatus',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Creeping Rubus is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Rubus_pedatus_1.jpg/500px-Rubus_pedatus_1.jpg"
  },
  "creeping zinnia": {
    plantName: 'Creeping Zinnia',
    scientificName: 'Sanvitalia spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Creeping Zinnia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Sanvitalia_procumbens_-_plants_%28aka%29.jpg/500px-Sanvitalia_procumbens_-_plants_%28aka%29.jpg"
  },
  "crossandra": {
    plantName: 'Crossandra',
    scientificName: 'Crossandra species',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Crossandra is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Crossandra_infundibuliformis.JPG/500px-Crossandra_infundibuliformis.JPG"
  },
  "cucumber": {
    plantName: 'Cucumber',
    scientificName: 'Cucumis sativus',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cucumber is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/ARS_cucumber.jpg/500px-ARS_cucumber.jpg"
  },
  "cushion aloe": {
    plantName: 'Cushion Aloe',
    scientificName: 'Aloe retusa',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cushion Aloe is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/2_Haworthia_retusa_-_Acilliers_-_RSA_1.jpg/500px-2_Haworthia_retusa_-_Acilliers_-_RSA_1.jpg"
  },
  "cyrtudeira": {
    plantName: 'Cyrtudeira',
    scientificName: 'Episcia reptans',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Cyrtudeira is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Episcia_reptans1.jpg/500px-Episcia_reptans1.jpg"
  },
  "dainty rabbits-foot fern": {
    plantName: 'Dainty Rabbits-Foot Fern',
    scientificName: 'Davallia fejeensis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Dainty Rabbits-Foot Fern is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/DavalliaFejeensis.jpg/500px-DavalliaFejeensis.jpg"
  },
  "dancing doll orchid": {
    plantName: 'Dancing Doll Orchid',
    scientificName: 'Oncidium flexuosum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Dancing Doll Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/OncidiumFlexuosum.jpg/500px-OncidiumFlexuosum.jpg"
  },
  "desert trumpet": {
    plantName: 'Desert Trumpet',
    scientificName: 'Eriogonium inflatum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Desert Trumpet is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Eriogonum_inflatum_1.jpg/500px-Eriogonum_inflatum_1.jpg"
  },
  "dichelostemma": {
    plantName: 'Dichelostemma',
    scientificName: 'Dichelostemma species',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Dichelostemma is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Dichelostemma_capitatum_2003-02-04.jpg/500px-Dichelostemma_capitatum_2003-02-04.jpg"
  },
  "dichorisandra reginae": {
    plantName: 'Dichorisandra Reginae',
    scientificName: 'Dichorisandra reginae',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Dichorisandra Reginae is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Dichorisandra_thyrsiflora%2C_RBGE_2009.jpg/500px-Dichorisandra_thyrsiflora%2C_RBGE_2009.jpg"
  },
  "dill": {
    plantName: 'Dill',
    scientificName: 'Anethum graveolena',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Dill is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Illustration_Anethum_graveolens_clean.jpg/500px-Illustration_Anethum_graveolens_clean.jpg"
  },
  "dinteranthus": {
    plantName: 'Dinteranthus',
    scientificName: 'Dinteranthus vanzylii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Dinteranthus is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Dintheranthus_wilmotianus1.jpg/500px-Dintheranthus_wilmotianus1.jpg"
  },
  "dwarf date palm": {
    plantName: 'Dwarf Date Palm',
    scientificName: 'Phoenix acaulis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Dwarf Date Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Phoenix_acaulis_kz2.jpg/500px-Phoenix_acaulis_kz2.jpg"
  },
  "dwarf feather palm": {
    plantName: 'Dwarf Feather Palm',
    scientificName: 'Nephrolepis exalta',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Dwarf Feather Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Cocos_nucifera_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-187.jpg/500px-Cocos_nucifera_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-187.jpg"
  },
  "dwarf rose-stripe star": {
    plantName: 'Dwarf Rose-Stripe Star',
    scientificName: 'Cryptanthus bivattus minor',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Dwarf Rose-Stripe Star is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Red_delicious_and_cross_section.jpg/500px-Red_delicious_and_cross_section.jpg"
  },
  "dwarf royal palm": {
    plantName: 'Dwarf Royal Palm',
    scientificName: 'Veitchia merillii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Dwarf Royal Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Starr_070124-3839_Phoenix_roebelenii.jpg/500px-Starr_070124-3839_Phoenix_roebelenii.jpg"
  },
  "dwarf whitman fern": {
    plantName: 'Dwarf Whitman Fern',
    scientificName: 'Nephrolepsis cordifolia plumosa',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Dwarf Whitman Fern is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/500px-Flag_of_the_United_States.svg.png"
  },
  "easter cattleya": {
    plantName: 'Easter Cattleya',
    scientificName: 'Cattleya mossiae',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Easter Cattleya is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Cattleya_mossiae_%28dew_in_Venezuela%29.JPG/500px-Cattleya_mossiae_%28dew_in_Venezuela%29.JPG"
  },
  "easter daisy": {
    plantName: 'Easter Daisy',
    scientificName: 'Townsendia sericea',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Easter Daisy is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Townsendiaparryi.jpg/500px-Townsendiaparryi.jpg"
  },
  "easter lily cactus": {
    plantName: 'Easter Lily Cactus',
    scientificName: 'Echinopsis multiplex',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Easter Lily Cactus is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Echinopsis_oxygona_%285%29.jpg/500px-Echinopsis_oxygona_%285%29.jpg"
  },
  "emerald ripple peperomia": {
    plantName: 'Emerald Ripple Peperomia',
    scientificName: 'Peperomia caperata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Emerald Ripple Peperomia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Peperomia_caperata_1-OB9.jpg/500px-Peperomia_caperata_1-OB9.jpg"
  },
  "english hawthorn": {
    plantName: 'English Hawthorn',
    scientificName: 'Crataegus laevigata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'English Hawthorn is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Crataegus_laevigata-flowers.jpg/500px-Crataegus_laevigata-flowers.jpg"
  },
  "fairy fountain": {
    plantName: 'Fairy Fountain',
    scientificName: 'Celosia cristata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Fairy Fountain is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/03092jfCelosia_argentea_var._cristata_Bulacanfvf_02.jpg/500px-03092jfCelosia_argentea_var._cristata_Bulacanfvf_02.jpg"
  },
  "false aralia": {
    plantName: 'False Aralia',
    scientificName: 'Dizygotheca elegantissima',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'False Aralia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Schefflera_elegantissima.jpg/500px-Schefflera_elegantissima.jpg"
  },
  "fan tufted palm": {
    plantName: 'Fan Tufted Palm',
    scientificName: 'Rhapis flabelliformis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Fan Tufted Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Washingtonia_filifera.jpg/500px-Washingtonia_filifera.jpg"
  },
  "fennel": {
    plantName: 'Fennel',
    scientificName: 'Foeniculum vulgare',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Fennel is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Foeniculum_July_2011-1a.jpg/500px-Foeniculum_July_2011-1a.jpg"
  },
  "fiery reed orchid": {
    plantName: 'Fiery Reed Orchid',
    scientificName: 'Epidendrum ibaguense',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Fiery Reed Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/A_and_B_Larsen_orchids_-_Epidendrum_ibaguense_DSCN5011.JPG/500px-A_and_B_Larsen_orchids_-_Epidendrum_ibaguense_DSCN5011.JPG"
  },
  "fig leaf gourd": {
    plantName: 'Fig Leaf Gourd',
    scientificName: 'Cucurbita ficifolia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Fig Leaf Gourd is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Cucurbita_ficifolia_Courge_de_Siam.jpg/500px-Cucurbita_ficifolia_Courge_de_Siam.jpg"
  },
  "figleaf palm": {
    plantName: 'Figleaf Palm',
    scientificName: 'Fatsia japonica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Figleaf Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Old_Fatsia_japonica_with_blosems.jpg/500px-Old_Fatsia_japonica_with_blosems.jpg"
  },
  "fingernail plant": {
    plantName: 'Fingernail Plant',
    scientificName: 'Neoregelia spectabilis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Fingernail Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Neoregelia_spectabilis_1.jpg/500px-Neoregelia_spectabilis_1.jpg"
  },
  "flame african violet": {
    plantName: 'Flame African Violet',
    scientificName: 'Episcia reptans',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Flame African Violet is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Episcia_reptans1.jpg/500px-Episcia_reptans1.jpg"
  },
  "flame of the woods": {
    plantName: 'Flame of the Woods',
    scientificName: 'Ixora coccinea',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Flame of the Woods is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Ixora_coccinea.jpg/500px-Ixora_coccinea.jpg"
  },
  "florida butterfly orchid": {
    plantName: 'Florida Butterfly Orchid',
    scientificName: 'Encyclia tampensis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Florida Butterfly Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Encycliatampensis.jpg/500px-Encycliatampensis.jpg"
  },
  "florida scarlet orchid": {
    plantName: 'Florida Scarlet Orchid',
    scientificName: 'Epidendrum tampense',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Florida Scarlet Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Encycliatampensis.jpg/500px-Encycliatampensis.jpg"
  },
  "forster sentry palm": {
    plantName: 'Forster Sentry Palm',
    scientificName: 'Howea forsteriana',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Forster Sentry Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Howea_forsteriana_Lord_Howe_Island.jpg/500px-Howea_forsteriana_Lord_Howe_Island.jpg"
  },
  "fortunes palm": {
    plantName: 'Fortunes Palm',
    scientificName: 'Trachycarpus fortunei',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Fortunes Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/TrachycarpusFortunei.jpg/500px-TrachycarpusFortunei.jpg"
  },
  "friendship plant": {
    plantName: 'Friendship Plant',
    scientificName: 'Pilea involucrata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Friendship Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Pilea_involucrata%2C_Jard%C3%ADn_Bot%C3%A1nico%2C_M%C3%BAnich%2C_Alemania_2012-04-21%2C_DD_02.jpg/500px-Pilea_involucrata%2C_Jard%C3%ADn_Bot%C3%A1nico%2C_M%C3%BAnich%2C_Alemania_2012-04-21%2C_DD_02.jpg"
  },
  "garden marigold": {
    plantName: 'Garden Marigold',
    scientificName: 'Calendula officinalis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Garden Marigold is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Calendula_officinalis%2C_pot_marigold.JPG/500px-Calendula_officinalis%2C_pot_marigold.JPG"
  },
  "ghost plant": {
    plantName: 'Ghost Plant',
    scientificName: 'Sedum weinbergii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Ghost Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Sedum_acre_single_-_Niitv%C3%A4lja.jpg/500px-Sedum_acre_single_-_Niitv%C3%A4lja.jpg"
  },
  "giant holly fern": {
    plantName: 'Giant Holly Fern',
    scientificName: 'Ploystichum munitum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Giant Holly Fern is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: null
  },
  "globe thistle": {
    plantName: 'Globe Thistle',
    scientificName: 'Echinops spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Globe Thistle is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Echinops_adenocaulos.jpg/500px-Echinops_adenocaulos.jpg"
  },
  "gloxinia": {
    plantName: 'Gloxinia',
    scientificName: 'Sinningia speciosa',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Gloxinia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Florada_da_Glox%C3%ADnia.jpg/500px-Florada_da_Glox%C3%ADnia.jpg"
  },
  "golden lace orchid": {
    plantName: 'Golden Lace Orchid',
    scientificName: 'Haemaria discolor',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Golden Lace Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/4/46/Haem3.jpg"
  },
  "golden shower orchid": {
    plantName: 'Golden Shower Orchid',
    scientificName: 'Oncidium sphacelatum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Golden Shower Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Oncidium_sphacelatum03.jpg/500px-Oncidium_sphacelatum03.jpg"
  },
  "grape hyacinth": {
    plantName: 'Grape Hyacinth',
    scientificName: 'Muscari armeniacum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Grape Hyacinth is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Muscari_armeniacum_4.jpg/500px-Muscari_armeniacum_4.jpg"
  },
  "grape ivy": {
    plantName: 'Grape Ivy',
    scientificName: 'Cissus rhombifolia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Grape Ivy is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Cissus_alata_Leaves.JPG/500px-Cissus_alata_Leaves.JPG"
  },
  "hardy baby tears": {
    plantName: 'Hardy Baby Tears',
    scientificName: 'Sedum album',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Hardy Baby Tears is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/White_stonecrop%2C_Autonomous_Province_of_Bolzano_%E2%80%93_South_Tyrol%2C_Italy_imported_from_iNaturalist_photo_382140510.jpg/500px-White_stonecrop%2C_Autonomous_Province_of_Bolzano_%E2%80%93_South_Tyrol%2C_Italy_imported_from_iNaturalist_photo_382140510.jpg"
  },
  "hardy gloxinia": {
    plantName: 'Hardy Gloxinia',
    scientificName: 'Incarvillea delavayi',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Hardy Gloxinia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Incarvillea_delavayi2.JPG/500px-Incarvillea_delavayi2.JPG"
  },
  "haworthia": {
    plantName: 'Haworthia',
    scientificName: 'Haworthia species',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Haworthia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Haworthia_cymbiformis_1.jpg/500px-Haworthia_cymbiformis_1.jpg"
  },
  "hawthorn": {
    plantName: 'Hawthorn',
    scientificName: 'Crataegus species',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Hawthorn is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Crataegus%2C_various_species%2C_fruit.jpg/500px-Crataegus%2C_various_species%2C_fruit.jpg"
  },
  "hedgehog gourd": {
    plantName: 'Hedgehog Gourd',
    scientificName: 'Cucumis dipsaceus',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Hedgehog Gourd is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Cucumis_dipsaceus_leaves_and_fruit.jpg"
  },
  "hemlock tree": {
    plantName: 'Hemlock Tree',
    scientificName: 'Tsuga species',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Hemlock Tree is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Tsuga_canadensis_PAN_2.JPG/500px-Tsuga_canadensis_PAN_2.JPG"
  },
  "hen and chickens fern": {
    plantName: 'Hen and Chickens Fern',
    scientificName: 'Asplenium bulbiferum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Hen and Chickens Fern is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Asplenium_bulbiferum_kz3.jpg/500px-Asplenium_bulbiferum_kz3.jpg"
  },
  "hibiscus": {
    plantName: 'Hibiscus',
    scientificName: 'Hibiscus syriacus',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Hibiscus is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Hibiscus_Syriacus.JPG/500px-Hibiscus_Syriacus.JPG"
  },
  "hoary alyssum": {
    plantName: 'Hoary Alyssum',
    scientificName: 'Berteroa incana',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Hoary Alyssum is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Berteroa_incana.jpg"
  },
  "hollyhock": {
    plantName: 'Hollyhock',
    scientificName: 'Alcea rosea',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Hollyhock is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Alcea_rosea_purple.jpg/500px-Alcea_rosea_purple.jpg"
  },
  "honey locust": {
    plantName: 'Honey Locust',
    scientificName: 'Gleditsia triacanthos',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Honey Locust is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Gleditsia_triacanthos_%28Honeylocust%29_%2838246396371%29.jpg/500px-Gleditsia_triacanthos_%28Honeylocust%29_%2838246396371%29.jpg"
  },
  "honey plant": {
    plantName: 'Honey Plant',
    scientificName: 'Hoya carnosa',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Honey Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/NKN-2007-06-13_114250_Hoya_Carnosa_%28Yvan_Leduc_author_for_Wikipedia%29.jpg/500px-NKN-2007-06-13_114250_Hoya_Carnosa_%28Yvan_Leduc_author_for_Wikipedia%29.jpg"
  },
  "honeysuckle fuchsia": {
    plantName: 'Honeysuckle Fuchsia',
    scientificName: 'Fuchsia triphylla',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Honeysuckle Fuchsia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Fuchsia_triphylla_kz01.jpg/500px-Fuchsia_triphylla_kz01.jpg"
  },
  "hubbard squash": {
    plantName: 'Hubbard Squash',
    scientificName: 'Cucurbita maxima var. hubbard',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Hubbard Squash is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cucurbita_maxima_Blanco2.320.png/500px-Cucurbita_maxima_Blanco2.320.png"
  },
  "ice plant": {
    plantName: 'Ice Plant',
    scientificName: 'Lampranthus piquet',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Ice Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Insular_Ice_Plant_Manila.jpg/500px-Insular_Ice_Plant_Manila.jpg"
  },
  "ivy peperomia": {
    plantName: 'Ivy Peperomia',
    scientificName: 'Peperomia griseoargentea',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Ivy Peperomia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Peperomia_griseoargentea.jpg/500px-Peperomia_griseoargentea.jpg"
  },
  "jackson brier": {
    plantName: 'Jackson Brier',
    scientificName: 'Smilax lanceolata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Jackson Brier is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Smilax_laurifolia_%282020%29.jpg/500px-Smilax_laurifolia_%282020%29.jpg"
  },
  "japanese pittosporum": {
    plantName: 'Japanese Pittosporum',
    scientificName: 'Pittosporum tobira',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Japanese Pittosporum is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Pittosporum_Tobira_JPG0.jpg/500px-Pittosporum_Tobira_JPG0.jpg"
  },
  "jasmine": {
    plantName: 'Jasmine',
    scientificName: 'Jasminum species',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Jasmine is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Common_Jasmine.jpg/500px-Common_Jasmine.jpg"
  },
  "jungle geranium": {
    plantName: 'Jungle Geranium',
    scientificName: 'Ixora javanica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Jungle Geranium is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Luculia_gratissima.jpg/500px-Luculia_gratissima.jpg"
  },
  "kaempferia": {
    plantName: 'Kaempferia',
    scientificName: 'Kaempferia spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Kaempferia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Galangal.web.jpg/500px-Galangal.web.jpg"
  },
  "kahali ginger": {
    plantName: 'Kahali Ginger',
    scientificName: 'Hedychium gardnerianum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Kahali Ginger is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Hedychium_gardnerianum.jpg/500px-Hedychium_gardnerianum.jpg"
  },
  "kenilworth ivy": {
    plantName: 'Kenilworth Ivy',
    scientificName: 'Cymbalaria muralis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Kenilworth Ivy is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Ivy-leaved_Toadflax_%28Cymbalaria_muralis%29_%284732404596%29.jpg/500px-Ivy-leaved_Toadflax_%28Cymbalaria_muralis%29_%284732404596%29.jpg"
  },
  "kenya violet": {
    plantName: 'Kenya Violet',
    scientificName: 'Saintpaulia confusa',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Kenya Violet is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Streptocarpus_ionanthus_%28as_Saintpaulia_ionantha%29_-_Curtis%27_121_%28Ser._3_no._51%29_pl._7408_%281895%29.jpg/500px-Streptocarpus_ionanthus_%28as_Saintpaulia_ionantha%29_-_Curtis%27_121_%28Ser._3_no._51%29_pl._7408_%281895%29.jpg"
  },
  "king of the forest": {
    plantName: 'King of the Forest',
    scientificName: 'Anoectuchilus setaceus',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'King of the Forest is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Rosa_Bonheur_-_Le_Roi_de_la_for%C3%AAt.jpg/500px-Rosa_Bonheur_-_Le_Roi_de_la_for%C3%AAt.jpg"
  },
  "lace orchid": {
    plantName: 'Lace Orchid',
    scientificName: 'Odontoglossum crispum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Lace Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Odontoglossum_crispum.jpg/500px-Odontoglossum_crispum.jpg"
  },
  "ladies ear drops": {
    plantName: 'Ladies Ear Drops',
    scientificName: 'Fuschsia spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Ladies Ear Drops is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/2018_Ken_Hom_Lecture_-_Fuchsia_Dunlop_cropped.jpg/500px-2018_Ken_Hom_Lecture_-_Fuchsia_Dunlop_cropped.jpg"
  },
  "lemon balm": {
    plantName: 'Lemon Balm',
    scientificName: 'Melissa officinalis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Lemon Balm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Lemon_balm_plant.jpg/500px-Lemon_balm_plant.jpg"
  },
  "leopard orchid": {
    plantName: 'Leopard Orchid',
    scientificName: 'Dendrobium gracilicaule',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Leopard Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Dendrobium_gracilicaule.jpg/500px-Dendrobium_gracilicaule.jpg"
  },
  "lily of the valley orchid": {
    plantName: 'Lily of the Valley Orchid',
    scientificName: 'Odontoglossum pulchellum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Lily of the Valley Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Victoria_cruziana_flower.jpg"
  },
  "linden": {
    plantName: 'Linden',
    scientificName: 'Tilia americana',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Linden is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Tilia_americana_%28American_Linden%29_%2828268263222%29.jpg/500px-Tilia_americana_%28American_Linden%29_%2828268263222%29.jpg"
  },
  "lipstick plant": {
    plantName: 'Lipstick Plant',
    scientificName: 'Aeschynanthus humilis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Lipstick Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Aeschynanthus_pulcher%2C_Lipstick_Plant.jpg/500px-Aeschynanthus_pulcher%2C_Lipstick_Plant.jpg"
  },
  "little zebra plant": {
    plantName: 'Little Zebra Plant',
    scientificName: 'Haworthia subfasciata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Little Zebra Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/7_Tulista_kingiana_from_Mossel_Bay.jpg/500px-7_Tulista_kingiana_from_Mossel_Bay.jpg"
  },
  "living rock cactus": {
    plantName: 'Living Rock Cactus',
    scientificName: 'Pleiospilos bolusii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Living Rock Cactus is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Aizoaceae_-_Pleiospilos_bolusii.JPG/500px-Aizoaceae_-_Pleiospilos_bolusii.JPG"
  },
  "living stones": {
    plantName: 'Living Stones',
    scientificName: 'Lithops naureeniae',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Living Stones is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Naureeniae-020911.jpg/500px-Naureeniae-020911.jpg"
  },
  "loco weed": {
    plantName: 'Loco Weed',
    scientificName: 'Oxytropis spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Loco Weed is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Oxytropis_jaquinii.JPG/500px-Oxytropis_jaquinii.JPG"
  },
  "madagascar jasmine": {
    plantName: 'Madagascar Jasmine',
    scientificName: 'Stephanotis floribunda',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Madagascar Jasmine is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Stephanotis_floribunda3L._Marie.jpg/500px-Stephanotis_floribunda3L._Marie.jpg"
  },
  "magnolia bush": {
    plantName: 'Magnolia Bush',
    scientificName: 'Magnolia stellata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Magnolia Bush is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Magnolia_stellata_fleurs.jpg/500px-Magnolia_stellata_fleurs.jpg"
  },
  "creeping mahonia": {
    plantName: 'Creeping Mahonia',
    scientificName: 'Mahonia aquifolium',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Creeping Mahonia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Mahonia_aquifolium.jpg/500px-Mahonia_aquifolium.jpg"
  },
  "majesty palm": {
    plantName: 'Majesty Palm',
    scientificName: 'Ravenea rivularis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Majesty Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Ravenearivularis.jpg/500px-Ravenearivularis.jpg"
  },
  "mariposa lily": {
    plantName: 'Mariposa Lily',
    scientificName: 'Calochortus gunnisonii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Mariposa Lily is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Calochortus_gunnisonii_gunnisonii1.jpg/500px-Calochortus_gunnisonii_gunnisonii1.jpg"
  },
  "maroon chenille plant": {
    plantName: 'Maroon Chenille Plant',
    scientificName: 'Echeveria derenbergii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Maroon Chenille Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Echeveria_derenbergii_-_JBM.jpg/500px-Echeveria_derenbergii_-_JBM.jpg"
  },
  "measles plant": {
    plantName: 'Measles Plant',
    scientificName: 'Hypoestes phyllostachya',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Measles Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Starr_080117-1693_Hypoestes_phyllostachya.jpg/500px-Starr_080117-1693_Hypoestes_phyllostachya.jpg"
  },
  "mexican firecracker": {
    plantName: 'Mexican Firecracker',
    scientificName: 'Echeveria Pulinata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Mexican Firecracker is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Mexican_honeysuckle_--_Justicia_spicigera.jpg/500px-Mexican_honeysuckle_--_Justicia_spicigera.jpg"
  },
  "miniature date palm": {
    plantName: 'Miniature Date Palm',
    scientificName: 'Phoenix robellinii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Miniature Date Palm is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Starr_070124-3839_Phoenix_roebelenii.jpg/500px-Starr_070124-3839_Phoenix_roebelenii.jpg"
  },
  "mistletoe cactus": {
    plantName: 'Mistletoe Cactus',
    scientificName: 'Rhipsalis cassutha',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Mistletoe Cactus is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Rhipsalis_baccifera_01_ies.jpg/500px-Rhipsalis_baccifera_01_ies.jpg"
  },
  "mockernut hickory": {
    plantName: 'Mockernut Hickory',
    scientificName: 'Carya tomentosa',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Mockernut Hickory is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Carya_tomentosa_12zz.jpg/500px-Carya_tomentosa_12zz.jpg"
  },
  "money tree": {
    plantName: 'Money Tree',
    scientificName: 'Pachira aquatica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Money Tree is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Flickr_-_archer10_%28Dennis%29_-_Guatemala-1376.jpg/500px-Flickr_-_archer10_%28Dennis%29_-_Guatemala-1376.jpg"
  },
  "mosaic plant": {
    plantName: 'Mosaic Plant',
    scientificName: 'Bertolonia mosaica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Mosaic Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Colpfl25.jpg/500px-Colpfl25.jpg"
  },
  "mosaic vase": {
    plantName: 'Mosaic Vase',
    scientificName: 'Guzmania musaica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Mosaic Vase is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Guzmania_musaica_29838465.jpg/500px-Guzmania_musaica_29838465.jpg"
  },
  "moss campion": {
    plantName: 'Moss Campion',
    scientificName: 'Silene acaulis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Moss Campion is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Silene_acaulis_-_Fjellsmelle.jpg/500px-Silene_acaulis_-_Fjellsmelle.jpg"
  },
  "moss phlox": {
    plantName: 'Moss Phlox',
    scientificName: 'Phlox subulata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Moss Phlox is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Shibazakura.JPG/500px-Shibazakura.JPG"
  },
  "mountain camellia": {
    plantName: 'Mountain Camellia',
    scientificName: 'Stewartia ovata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Mountain Camellia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Stuartia_ovata.gif"
  },
  "mulberry tree": {
    plantName: 'Mulberry Tree',
    scientificName: 'Morus sp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Mulberry Tree is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Morus_alba_FrJPG.jpg/500px-Morus_alba_FrJPG.jpg"
  },
  "nasturtium": {
    plantName: 'Nasturtium',
    scientificName: 'Tropaeolum majus',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Nasturtium is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Tropaeolum_majus_2005_G1.jpg/500px-Tropaeolum_majus_2005_G1.jpg"
  },
  "natal plum": {
    plantName: 'Natal Plum',
    scientificName: 'Carissa grandiflora',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Natal Plum is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Starr_010820-0009_Carissa_macrocarpa.jpg/500px-Starr_010820-0009_Carissa_macrocarpa.jpg"
  },
  "nerve plant": {
    plantName: 'Nerve Plant',
    scientificName: 'Fittonia verschaffeltii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Nerve Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Colpfl25.jpg/500px-Colpfl25.jpg"
  },
  "night blooming cereus": {
    plantName: 'Night Blooming Cereus',
    scientificName: 'Hylocereus undatus',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Night Blooming Cereus is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Pitaya_cross_section_ed2.jpg/500px-Pitaya_cross_section_ed2.jpg"
  },
  "old man cactus": {
    plantName: 'Old Man Cactus',
    scientificName: 'Cephalocereus senilis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Old Man Cactus is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Cephalocereus_senilis.jpg/500px-Cephalocereus_senilis.jpg"
  },
  "orange star": {
    plantName: 'Orange Star',
    scientificName: 'Guzmania lingulata minor',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Orange Star is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Bromeliaceae03.jpg/500px-Bromeliaceae03.jpg"
  },
  "paddys wig": {
    plantName: 'Paddys Wig',
    scientificName: 'Soleirolia soleirolii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Paddys Wig is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Soleirolia_soleirolii002.JPG/500px-Soleirolia_soleirolii002.JPG"
  },
  "pampas grass": {
    plantName: 'Pampas Grass',
    scientificName: 'Cortaderia selloana',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Pampas Grass is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Herbe_Pampa_FR_2008.jpg/500px-Herbe_Pampa_FR_2008.jpg"
  },
  "pansy orchid": {
    plantName: 'Pansy Orchid',
    scientificName: 'Miltonia roezlii alba',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Pansy Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Miltonia_spectabilis_1.jpg/500px-Miltonia_spectabilis_1.jpg"
  },
  "pearl plant": {
    plantName: 'Pearl Plant',
    scientificName: 'Haworthia margaritifera',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Pearl Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/1_Haworthia_maxima_in_habitat_-_Worcester_South_Africa.jpg/500px-1_Haworthia_maxima_in_habitat_-_Worcester_South_Africa.jpg"
  },
  "peperomia peltfolia": {
    plantName: 'Peperomia Peltfolia',
    scientificName: 'Peperomia peltifolia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Peperomia Peltfolia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: null
  },
  "peperomia rotundifolia": {
    plantName: 'Peperomia Rotundifolia',
    scientificName: 'Peperomia rotundifolia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Peperomia Rotundifolia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Peperomia_rotundifolia_var._rotundifolia.jpg/500px-Peperomia_rotundifolia_var._rotundifolia.jpg"
  },
  "peperomia sandersii": {
    plantName: 'Peperomia Sandersii',
    scientificName: 'Peperomia sandersii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Peperomia Sandersii is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Sonora_Map1.gif/500px-Sonora_Map1.gif"
  },
  "peruvian lily": {
    plantName: 'Peruvian Lily',
    scientificName: 'Alstroemeria',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Peruvian Lily is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Alstroemeria_aurantiaca.jpg/500px-Alstroemeria_aurantiaca.jpg"
  },
  "petunia": {
    plantName: 'Petunia',
    scientificName: 'Petunia species',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Petunia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Pet%C3%BAnia_%28do_tupi_petyma%2C_%27tabaco%27%29.jpg/500px-Pet%C3%BAnia_%28do_tupi_petyma%2C_%27tabaco%27%29.jpg"
  },
  "phalaenopsis orchid": {
    plantName: 'Phalaenopsis Orchid',
    scientificName: 'Phalaenopsis sp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Phalaenopsis Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Phalaenopsis_philippinensis_NationalOrchidGarden-Singapore.jpg/500px-Phalaenopsis_philippinensis_NationalOrchidGarden-Singapore.jpg"
  },
  "pheasant plant": {
    plantName: 'Pheasant Plant',
    scientificName: 'Cryptanthus zonatus',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Pheasant Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/CryptanthusZonatusZebrinus.jpg/500px-CryptanthusZonatusZebrinus.jpg"
  },
  "piggy back plant": {
    plantName: 'Piggy Back Plant',
    scientificName: 'Tolmeia menziesii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Piggy Back Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: null
  },
  "pink brocade": {
    plantName: 'Pink Brocade',
    scientificName: 'Episcia cultivar',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Pink Brocade is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Episcia_reptans1.jpg/500px-Episcia_reptans1.jpg"
  },
  "platycerium alcicorne": {
    plantName: 'Platycerium Alcicorne',
    scientificName: 'Platycerium alcicorne',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Platycerium Alcicorne is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Platycerium_alcicorne_-_Berlin_Botanical_Garden_-_IMG_8687.JPG/500px-Platycerium_alcicorne_-_Berlin_Botanical_Garden_-_IMG_8687.JPG"
  },
  "plumbago larpentiae": {
    plantName: 'Plumbago Larpentiae',
    scientificName: 'Ceratostigma larpentiae',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Plumbago Larpentiae is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: null
  },
  "plush plant": {
    plantName: 'Plush Plant',
    scientificName: 'Echeveria pul-oliver',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Plush Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Echeveria_pulvinata_%27Ruby%27.jpg/500px-Echeveria_pulvinata_%27Ruby%27.jpg"
  },
  "poison ivy": {
    plantName: 'Poison Ivy',
    scientificName: 'Toxicodendron species',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Poison Ivy is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Toxicodendron_radicans.jpg/500px-Toxicodendron_radicans.jpg"
  },
  "prairie lily": {
    plantName: 'Prairie Lily',
    scientificName: 'Zephyranthes drummondii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Prairie Lily is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Curtis%27s_botanical_magazine_%28Plate_3727%29_%289126453739%29.jpg/500px-Curtis%27s_botanical_magazine_%28Plate_3727%29_%289126453739%29.jpg"
  },
  "prostrate coleus": {
    plantName: 'Prostrate Coleus',
    scientificName: 'Plectranthus oetendahlii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Prostrate Coleus is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Lisc_lipy.jpg/500px-Lisc_lipy.jpg"
  },
  "purple baby tears": {
    plantName: 'Purple Baby Tears',
    scientificName: 'Frithia pulchra',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Purple Baby Tears is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Frithia_pulchra10.jpg/500px-Frithia_pulchra10.jpg"
  },
  "purple passion vine": {
    plantName: 'Purple Passion Vine',
    scientificName: 'Gynura aurantica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Purple Passion Vine is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Passiflora_incarnata_fruit.jpg/500px-Passiflora_incarnata_fruit.jpg"
  },
  "purple waffle plant": {
    plantName: 'Purple Waffle Plant',
    scientificName: 'Hemigraphis exotica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Purple Waffle Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Strobilanthes_alternata_3590.jpg/500px-Strobilanthes_alternata_3590.jpg"
  },
  "queencup": {
    plantName: 'Queencup',
    scientificName: 'Clintonia uniflora',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Queencup is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Clintonia_uniflora_9062.JPG/500px-Clintonia_uniflora_9062.JPG"
  },
  "queensland arrowroot": {
    plantName: 'Queensland Arrowroot',
    scientificName: 'Canna edulis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Queensland Arrowroot is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Cinnamon-bellied_flowerpiercer_%28Diglossa_baritula%29_male_on_Indian_shot_%28Canna_indica%29_Finca_El_Pilar.jpg/500px-Cinnamon-bellied_flowerpiercer_%28Diglossa_baritula%29_male_on_Indian_shot_%28Canna_indica%29_Finca_El_Pilar.jpg"
  },
  "rainbow orchid": {
    plantName: 'Rainbow Orchid',
    scientificName: 'Epidendrum prismatocarpum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Rainbow Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/GarenEwing2009.jpg/500px-GarenEwing2009.jpg"
  },
  "red berried greenbrier": {
    plantName: 'Red Berried Greenbrier',
    scientificName: 'Smilax walteria',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Red Berried Greenbrier is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Smilax_aspera.jpg/500px-Smilax_aspera.jpg"
  },
  "red edge peperomia": {
    plantName: 'Red Edge Peperomia',
    scientificName: 'Peperomia clusiifolia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Red Edge Peperomia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Peperomia_clusiifolia-flower-yercaud-salem-India.JPG/500px-Peperomia_clusiifolia-flower-yercaud-salem-India.JPG"
  },
  "red maple": {
    plantName: 'Red Maple',
    scientificName: 'Acer rubrum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Red Maple is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Acer_rubrum_15-p.bot-a.rubrum-114.jpg/500px-Acer_rubrum_15-p.bot-a.rubrum-114.jpg"
  },
  "red palm lily": {
    plantName: 'Red Palm Lily',
    scientificName: 'Cordyline rubra',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Red Palm Lily is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Cordyline_rubra_Coffs.jpg/500px-Cordyline_rubra_Coffs.jpg"
  },
  "rose": {
    plantName: 'Rose',
    scientificName: 'Rosa Species',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Rose is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/ROSA_One%C2%AE_Robot_.jpg/500px-ROSA_One%C2%AE_Robot_.jpg"
  },
  "rosemary": {
    plantName: 'Rosemary',
    scientificName: 'Rosmarinus officinalis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Rosemary is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Rosemary_in_bloom.JPG/500px-Rosemary_in_bloom.JPG"
  },
  "saffron spike zebra": {
    plantName: 'Saffron Spike Zebra',
    scientificName: 'Aphelandra squarrosa',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Saffron Spike Zebra is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/AphelandraSquarrosaWPC_edit.jpg/500px-AphelandraSquarrosaWPC_edit.jpg"
  },
  "sage": {
    plantName: 'Sage',
    scientificName: 'Salvia officinalis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Sage is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Salvia_officinalis0.jpg/500px-Salvia_officinalis0.jpg"
  },
  "saint bernards lily": {
    plantName: 'Saint Bernards Lily',
    scientificName: 'Anthericum liliago',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Saint Bernards Lily is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Pajecznica_liliowata_Anthericum_lilago3.jpg/500px-Pajecznica_liliowata_Anthericum_lilago3.jpg"
  },
  "salad burnet": {
    plantName: 'Salad Burnet',
    scientificName: 'Poterium sanguisorba',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Salad Burnet is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Wiesenknopf_Bl%C3%BCte_6260037-PSD-PSD.jpg/500px-Wiesenknopf_Bl%C3%BCte_6260037-PSD-PSD.jpg"
  },
  "sand lily": {
    plantName: 'Sand Lily',
    scientificName: 'Leucocrinum montanum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Sand Lily is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Leucocrinum_montanum_-_Cecelia_Alexander_04.jpg/500px-Leucocrinum_montanum_-_Cecelia_Alexander_04.jpg"
  },
  "sand verbena": {
    plantName: 'Sand Verbena',
    scientificName: 'Abronia fragrans',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Sand Verbena is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Abronia_fragrans_25461794.jpg/500px-Abronia_fragrans_25461794.jpg"
  },
  "satin pellionia": {
    plantName: 'Satin Pellionia',
    scientificName: 'Pellonia pulchra',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Satin Pellionia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Map_of_Sunda_and_Sahul.png/500px-Map_of_Sunda_and_Sahul.png"
  },
  "savory summer": {
    plantName: 'Savory Summer',
    scientificName: 'Satureja hortensis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Savory Summer is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Satureja_hortensis_bgiu.jpg/500px-Satureja_hortensis_bgiu.jpg"
  },
  "sawbrier": {
    plantName: 'Sawbrier',
    scientificName: 'Smilax glauca',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Sawbrier is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Smilax_glauca_6.JPG/500px-Smilax_glauca_6.JPG"
  },
  "scarborough lily": {
    plantName: 'Scarborough Lily',
    scientificName: 'Vallota speciosa',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Scarborough Lily is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Cyrtanthus_elatus_flowers.jpg/500px-Cyrtanthus_elatus_flowers.jpg"
  },
  "scarlet sage": {
    plantName: 'Scarlet Sage',
    scientificName: 'Salvia coccinea',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Scarlet Sage is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Salvia_coccinea_259451924.jpg/500px-Salvia_coccinea_259451924.jpg"
  },
  "silver bell": {
    plantName: 'Silver Bell',
    scientificName: 'Halesia carolina',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Silver Bell is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Halesia_carolina_%282%29.jpg/500px-Halesia_carolina_%282%29.jpg"
  },
  "silver heart": {
    plantName: 'Silver Heart',
    scientificName: 'Peperomia caperata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Silver Heart is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Peperomia_caperata_1-OB9.jpg/500px-Peperomia_caperata_1-OB9.jpg"
  },
  "silver pink vine": {
    plantName: 'Silver Pink Vine',
    scientificName: 'Hoya publcalyx',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Silver Pink Vine is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/%22A_Momordica_charantia-_bitter_guard_plant%22.jpg/500px-%22A_Momordica_charantia-_bitter_guard_plant%22.jpg"
  },
  "silver star": {
    plantName: 'Silver Star',
    scientificName: 'Cryptanthus lacerdae',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Silver Star is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Cryptanthus_lacerdae.JPG/500px-Cryptanthus_lacerdae.JPG"
  },
  "silver table fern": {
    plantName: 'Silver Table Fern',
    scientificName: 'Pteris sp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Silver Table Fern is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Pteris_vittata.jpg/500px-Pteris_vittata.jpg"
  },
  "slender deutzia": {
    plantName: 'Slender Deutzia',
    scientificName: 'Deutzia gracilis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Slender Deutzia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Deutzia_gracilis_A.jpg/500px-Deutzia_gracilis_A.jpg"
  },
  "spider flower": {
    plantName: 'Spider Flower',
    scientificName: 'Cleome hasserlana',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Spider Flower is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: null
  },
  "stevia": {
    plantName: 'Stevia',
    scientificName: 'Stevia rebaudiana',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Stevia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Stevia_rebaudiana_flowers.jpg/500px-Stevia_rebaudiana_flowers.jpg"
  },
  "strawberry": {
    plantName: 'Strawberry',
    scientificName: 'Fragaria spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Strawberry is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/103_Fragaria_vesca_L.jpg/500px-103_Fragaria_vesca_L.jpg"
  },
  "sudan grass": {
    plantName: 'Sudan Grass',
    scientificName: 'Sorghum vulgare var sudanesis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Sudan Grass is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Sorghum_sudanese.jpg/500px-Sorghum_sudanese.jpg"
  },
  "summer hyacinth": {
    plantName: 'Summer Hyacinth',
    scientificName: 'Galtonia spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Summer Hyacinth is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Galtonia_candicans_20070810-1335-175.jpg/500px-Galtonia_candicans_20070810-1335-175.jpg"
  },
  "sunflower": {
    plantName: 'Sunflower',
    scientificName: 'helianthus angustifolius',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Sunflower is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Helianthus_angustifolius_2.jpg/500px-Helianthus_angustifolius_2.jpg"
  },
  "swedish ivy": {
    plantName: 'Swedish Ivy',
    scientificName: 'Plectranthus australis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Swedish Ivy is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plectranthus_verticillatus_1.JPG/500px-Plectranthus_verticillatus_1.JPG"
  },
  "sweet pea": {
    plantName: 'Sweet Pea',
    scientificName: 'Lathyrus latifolius',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Sweet Pea is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/9/90/Lathyrus_latifolius_flowers.jpg"
  },
  "sweet potato vine": {
    plantName: 'Sweet Potato Vine',
    scientificName: 'Ipomoea batatas',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Sweet Potato Vine is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Ipomoea_batatas_006.JPG/500px-Ipomoea_batatas_006.JPG"
  },
  "sweetheart hoya": {
    plantName: 'Sweetheart Hoya',
    scientificName: 'Hoya kerrii',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Sweetheart Hoya is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Hoya-kerrii_flowers_op.jpg/500px-Hoya-kerrii_flowers_op.jpg"
  },
  "tailed orchid": {
    plantName: 'Tailed Orchid',
    scientificName: 'Masdevallia spp.',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Tailed Orchid is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Masdevallia_caudata_Orchi_01.jpg/500px-Masdevallia_caudata_Orchi_01.jpg"
  },
  "thyme": {
    plantName: 'Thyme',
    scientificName: 'Thymus vulgaris',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Thyme is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Thymus_vulgaris1.JPG/500px-Thymus_vulgaris1.JPG"
  },
  "tickseed": {
    plantName: 'Tickseed',
    scientificName: 'Coreopsis californica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Tickseed is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Coreopsisgigantea.jpg/500px-Coreopsisgigantea.jpg"
  },
  "toad spotted cactus": {
    plantName: 'Toad Spotted Cactus',
    scientificName: 'Stapelia variegata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Toad Spotted Cactus is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Orbea_variegata_%28lepida%29_%286452056223%29.jpg/500px-Orbea_variegata_%28lepida%29_%286452056223%29.jpg"
  },
  "torch lily": {
    plantName: 'Torch Lily',
    scientificName: 'Kniphofia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Torch Lily is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Kniphofia_uvaria_%28Xanthorrhoeaceae%29_%284576236590%29.jpg/500px-Kniphofia_uvaria_%28Xanthorrhoeaceae%29_%284576236590%29.jpg"
  },
  "trailing peperomia": {
    plantName: 'Trailing Peperomia',
    scientificName: 'Peperomia prostata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Trailing Peperomia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Peperomia_prostrata_kz01.jpg/500px-Peperomia_prostrata_kz01.jpg"
  },
  "tree cactus": {
    plantName: 'Tree Cactus',
    scientificName: 'Opuntia species',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Tree Cactus is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Opuntia_littoralis_var_vaseyi_4.jpg/500px-Opuntia_littoralis_var_vaseyi_4.jpg"
  },
  "tree gloxinia": {
    plantName: 'Tree Gloxinia',
    scientificName: 'Kohleria lindeniana',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Tree Gloxinia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Gloxinella_lindeniana_kz02.jpg/500px-Gloxinella_lindeniana_kz02.jpg"
  },
  "tulip poplar": {
    plantName: 'Tulip Poplar',
    scientificName: 'Liriodendron tulipifera',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Tulip Poplar is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Liriodendron_tulipifera_%28arbre%29_-_Laeken.JPG/500px-Liriodendron_tulipifera_%28arbre%29_-_Laeken.JPG"
  },
  "turban squash": {
    plantName: 'Turban Squash',
    scientificName: 'Cucurbita maxima cv turbaniformis',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Turban Squash is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mini_red_turban_pumpkin.jpg/500px-Mini_red_turban_pumpkin.jpg"
  },
  "turf lily": {
    plantName: 'Turf Lily',
    scientificName: 'Liriope muscari',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Turf Lily is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Liriope_muscari_4.JPG/500px-Liriope_muscari_4.JPG"
  },
  "umbrella plant": {
    plantName: 'Umbrella Plant',
    scientificName: 'Eriogonium umbellatum',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Umbrella Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Schefflera_arboricola%2C_vrugte%2C_a%2C_Pretoria.jpg/500px-Schefflera_arboricola%2C_vrugte%2C_a%2C_Pretoria.jpg"
  },
  "venus fly trap": {
    plantName: 'Venus Fly Trap',
    scientificName: 'Dionaea muscipula',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Venus Fly Trap is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Venus_Flytrap_showing_trigger_hairs.jpg/500px-Venus_Flytrap_showing_trigger_hairs.jpg"
  },
  "vining peperomia": {
    plantName: 'Vining Peperomia',
    scientificName: 'Peperomia serpens variegata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Vining Peperomia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Peperomia_trifolia_2011-01-17.jpg/500px-Peperomia_trifolia_2011-01-17.jpg"
  },
  "waffle plant": {
    plantName: 'Waffle Plant',
    scientificName: 'Hemigraphis exotica',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Waffle Plant is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Strobilanthes_alternata_3590.jpg/500px-Strobilanthes_alternata_3590.jpg"
  },
  "water hyacinth": {
    plantName: 'Water Hyacinth',
    scientificName: 'Eichhornia crassipes',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Water Hyacinth is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Eichhornia_crassipes_C.jpg/500px-Eichhornia_crassipes_C.jpg"
  },
  "watermelon begonia": {
    plantName: 'Watermelon Begonia',
    scientificName: 'Peperomia argyreia',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Watermelon Begonia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Peperomia_argyreia.jpg/500px-Peperomia_argyreia.jpg"
  },
  "wax rosette": {
    plantName: 'Wax Rosette',
    scientificName: 'Echeveria gilva',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Wax Rosette is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Echeveria_elegans_-_1.jpg/500px-Echeveria_elegans_-_1.jpg"
  },
  "yellow-flowered gourd": {
    plantName: 'Yellow-Flowered Gourd',
    scientificName: 'Cucurbita species',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Yellow-Flowered Gourd is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Squashes_at_Kew_Gardens_IncrEdibles_2013.jpg/500px-Squashes_at_Kew_Gardens_IncrEdibles_2013.jpg"
  },
  "yellowrocket": {
    plantName: 'Yellowrocket',
    scientificName: 'Barbarea vulgaris',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Yellowrocket is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/%28MHNT%29_Barbarea_vulgaris_-_Habit.jpg/500px-%28MHNT%29_Barbarea_vulgaris_-_Habit.jpg"
  },
  "zebra haworthia": {
    plantName: 'Zebra Haworthia',
    scientificName: 'Haworthia fasciata',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Zebra Haworthia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/1_Haworthia_fasciata_-MBB_Kabeljouws_River.jpg/500px-1_Haworthia_fasciata_-MBB_Kabeljouws_River.jpg"
  },
  "zinnia": {
    plantName: 'Zinnia',
    scientificName: 'Zinnia species',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Zinnia is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Zinnia_single_layer_and_12_Petals_2.jpg/500px-Zinnia_single_layer_and_12_Petals_2.jpg"
  },
  "zucchini squash": {
    plantName: 'Zucchini Squash',
    scientificName: 'Cucurbia pepo cv zucchini',
    isToxic: false,
    clinicalSigns: [],
    severity: 'None',
    actionRequired: 'Zucchini Squash is listed as non-toxic to cats by the ASPCA.',
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/CSA-Striped-Zucchini.jpg/500px-CSA-Striped-Zucchini.jpg"
  },
};
