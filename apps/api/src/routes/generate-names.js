import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

// Name generation data for different conventions
const nameData = {
  fantasy: {
    elven: {
      firstNames: [
        'Aelindor', 'Thalion', 'Elowen', 'Silvanus', 'Aelara', 'Theron', 'Lyralei',
        'Caelum', 'Elorian', 'Sylvara', 'Aelindel', 'Thaladir', 'Elowen', 'Silvain',
        'Aelion', 'Thalassa', 'Elorian', 'Caelwen', 'Lyrian', 'Silvara'
      ],
      lastNames: [
        'Moonwhisper', 'Starfire', 'Shadowblade', 'Windrunner', 'Sunbringer',
        'Nightshade', 'Stormborn', 'Lightbringer', 'Frostwind', 'Dawnbringer',
        'Silverleaf', 'Starweaver', 'Moonblade', 'Windwhisper', 'Sunwhisper'
      ]
    },
    dwarven: {
      firstNames: [
        'Thorin', 'Gimli', 'Balin', 'Dwalin', 'Bombur', 'Bifur', 'Bofur',
        'Dori', 'Nori', 'Ori', 'Oin', 'Gloin', 'Thrain', 'Thror', 'Durin',
        'Borin', 'Dain', 'Groin', 'Thror', 'Vili'
      ],
      lastNames: [
        'Ironforge', 'Stonehammer', 'Battleaxe', 'Goldbeard', 'Steelshield',
        'Bronzehelm', 'Firebeard', 'Blackstone', 'Silveraxe', 'Stonehelm',
        'Ironbeard', 'Hammerfist', 'Stonefist', 'Goldhelm', 'Steelbeard'
      ]
    }
  },
  'sci-fi': {
    futuristic: {
      firstNames: [
        'Zyx', 'Kael', 'Vex', 'Nyx', 'Orion', 'Cipher', 'Nova', 'Apex',
        'Nexus', 'Vortex', 'Zenith', 'Axis', 'Prism', 'Flux', 'Quantum',
        'Stellar', 'Cosmic', 'Void', 'Echo', 'Pulse'
      ],
      lastNames: [
        'Nexus', 'Vortex', 'Cipher', 'Quantum', 'Stellar', 'Cosmic', 'Void',
        'Echo', 'Pulse', 'Flux', 'Prism', 'Zenith', 'Apex', 'Axis', 'Nova',
        'Orion', 'Kael', 'Zyx', 'Nyx', 'Vex'
      ]
    },
    alien: {
      firstNames: [
        'Zar\'keth', 'Qu\'rix', 'Th\'aal', 'Kre\'vax', 'Syl\'thar', 'Vor\'nim',
        'Xel\'tus', 'Nar\'goth', 'Vel\'kris', 'Tyr\'esh', 'Kro\'vex', 'Shar\'kul',
        'Zex\'thar', 'Quel\'rix', 'Vor\'kesh', 'Nyx\'tul', 'Kre\'lix', 'Syl\'vex'
      ],
      lastNames: [
        'Zar\'keth', 'Qu\'rix', 'Th\'aal', 'Kre\'vax', 'Syl\'thar', 'Vor\'nim',
        'Xel\'tus', 'Nar\'goth', 'Vel\'kris', 'Tyr\'esh', 'Kro\'vex', 'Shar\'kul',
        'Zex\'thar', 'Quel\'rix', 'Vor\'kesh', 'Nyx\'tul', 'Kre\'lix', 'Syl\'vex'
      ]
    }
  },
  realistic: {
    modern: {
      firstNames: [
        'James', 'Mary', 'Robert', 'Patricia', 'Michael', 'Jennifer', 'William',
        'Linda', 'David', 'Barbara', 'Richard', 'Elizabeth', 'Joseph', 'Susan',
        'Thomas', 'Jessica', 'Charles', 'Sarah', 'Christopher', 'Karen'
      ],
      lastNames: [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
        'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
        'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
      ]
    }
  },
  historical: {
    medieval: {
      firstNames: [
        'William', 'Henry', 'Richard', 'Edward', 'John', 'Thomas', 'Robert',
        'Eleanor', 'Margaret', 'Catherine', 'Anne', 'Elizabeth', 'Mary', 'Joan',
        'Alice', 'Beatrice', 'Constance', 'Matilda', 'Philippa', 'Isabella'
      ],
      lastNames: [
        'of York', 'of Lancaster', 'of Normandy', 'of Anjou', 'of Aquitaine',
        'of Brittany', 'of Cornwall', 'of Kent', 'of Sussex', 'of Essex',
        'of Mercia', 'of Northumbria', 'of Wessex', 'of Wales', 'of Scotland'
      ]
    },
    ancient: {
      firstNames: [
        'Marcus', 'Julius', 'Augustus', 'Titus', 'Claudius', 'Nero', 'Vespasian',
        'Livia', 'Octavia', 'Agrippina', 'Drusilla', 'Messalina', 'Poppaea',
        'Antonia', 'Caligula', 'Domitian', 'Trajan', 'Hadrian', 'Antoninus', 'Marcus Aurelius'
      ],
      lastNames: [
        'Caesar', 'Augustus', 'Antoninus', 'Aurelius', 'Pius', 'Maximus',
        'Germanicus', 'Britannicus', 'Africanus', 'Scipio', 'Pompey', 'Cato',
        'Cicero', 'Brutus', 'Cassius', 'Antony', 'Octavian', 'Lepidus', 'Sulla', 'Marius'
      ]
    }
  }
};

/**
 * Get a random element from an array
 */
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate names based on convention
 */
function generateNames(convention, count) {
  const names = [];
  let firstNames = [];
  let lastNames = [];

  switch (convention) {
    case 'fantasy': {
      // Randomly choose between elven and dwarven
      const style = Math.random() > 0.5 ? 'elven' : 'dwarven';
      firstNames = nameData.fantasy[style].firstNames;
      lastNames = nameData.fantasy[style].lastNames;
      break;
    }

    case 'sci-fi': {
      // Randomly choose between futuristic and alien
      const style = Math.random() > 0.5 ? 'futuristic' : 'alien';
      firstNames = nameData['sci-fi'][style].firstNames;
      lastNames = nameData['sci-fi'][style].lastNames;
      break;
    }

    case 'realistic': {
      firstNames = nameData.realistic.modern.firstNames;
      lastNames = nameData.realistic.modern.lastNames;
      break;
    }

    case 'historical': {
      // Randomly choose between medieval and ancient
      const style = Math.random() > 0.5 ? 'medieval' : 'ancient';
      firstNames = nameData.historical[style].firstNames;
      lastNames = nameData.historical[style].lastNames;
      break;
    }

    default:
      throw new Error(
        `Invalid convention: ${convention}. Must be one of: fantasy, sci-fi, realistic, historical`
      );
  }

  // Generate requested number of names
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    names.push(`${firstName} ${lastName}`);
  }

  return names;
}

/**
 * POST /generate-names
 * Generate names based on convention and count
 * Body: { convention: string, count: number }
 * Returns: { names: string[] }
 */
router.post('/', async (req, res) => {
  const { convention, count } = req.body;

  // Validate convention parameter
  if (!convention) {
    return res.status(400).json({
      error: 'convention is required',
      validConventions: ['fantasy', 'sci-fi', 'realistic', 'historical'],
    });
  }

  // Validate count parameter
  if (!count) {
    return res.status(400).json({ error: 'count is required' });
  }

  if (typeof count !== 'number' || count < 1 || count > 100) {
    return res.status(400).json({
      error: 'count must be a number between 1 and 100',
    });
  }

  const validConventions = ['fantasy', 'sci-fi', 'realistic', 'historical'];
  if (!validConventions.includes(convention)) {
    return res.status(400).json({
      error: `Invalid convention: ${convention}`,
      validConventions,
    });
  }

  logger.info('Generating names', {
    convention,
    count,
  });

  // Generate names - throw error if something goes wrong
  const names = generateNames(convention, count);

  logger.info('Names generated successfully', {
    convention,
    count,
    generatedCount: names.length,
  });

  res.json({ names });
});

export default router;