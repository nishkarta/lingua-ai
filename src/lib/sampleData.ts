import {
  ReadingPassage,
  WritingPrompt,
  ListeningExercise,
  PronunciationChallenge,
  SpeakingScenario,
} from '@/types';

export const SAMPLE_READING_PASSAGES: ReadingPassage[] = [
  {
    id: 'pass-b2-ai',
    title: 'The Silent Revolution: Artificial Intelligence in Daily Life',
    level: 'B2',
    topic: 'Technology & Society',
    wordCount: 320,
    estimatedMinutes: 3,
    content: `Artificial intelligence is no longer confined to the realms of science fiction. Instead, it has quietly integrated itself into our mundane daily routines, transforming the way we work, communicate, and acquire knowledge. From predictive text algorithms that finish our sentences to navigation applications that anticipate traffic bottlenecks, machine learning models analyze colossal amounts of data in fractions of a second.

However, this profound integration brings both unprecedented opportunities and ethical dilemmas. While automation elevates productivity and eliminates repetitive drudgery, concerns regarding algorithmic bias and privacy infringement have ignited heated debates among sociologists and technologists alike. When an algorithm is trained on historical data, it inevitably inherits the subtle prejudices embedded within human history.

To navigate this evolving digital landscape successfully, individuals must cultivate critical thinking and digital literacy. Rather than passively consuming algorithmic recommendations, we should remain vigilant about the underlying mechanisms driving automated systems. The future belongs not to those who blindly resist automation, nor to those who submit without question, but to those who learn to collaborate harmoniously with intelligent technologies.`,
    vocabulary: [
      {
        word: 'confined',
        definition: 'To keep someone or something within limits; not allowed to spread beyond a boundary.',
        phonetic: '/kənˈfaɪnd/',
        partOfSpeech: 'verb (past participle)',
      },
      {
        word: 'mundane',
        definition: 'Very ordinary and therefore not interesting; relating to the ordinary world.',
        phonetic: '/mʌnˈdeɪn/',
        partOfSpeech: 'adjective',
      },
      {
        word: 'bottlenecks',
        definition: 'A place where a road becomes narrow, or a point of congestion in a system that impedes flow.',
        phonetic: '/ˈbɒt.əl.nek/',
        partOfSpeech: 'noun',
      },
      {
        word: 'unprecedented',
        definition: 'Never having happened or existed in the past.',
        phonetic: '/ʌnˈpres.ɪ.den.tɪd/',
        partOfSpeech: 'adjective',
      },
      {
        word: 'drudgery',
        definition: 'Hard, boring, and unpleasant work.',
        phonetic: '/ˈdrʌdʒ.ər.i/',
        partOfSpeech: 'noun',
      },
      {
        word: 'infringement',
        definition: 'An action that breaks a rule, law, or someone\'s rights.',
        phonetic: '/ɪnˈfrɪndʒ.mənt/',
        partOfSpeech: 'noun',
      },
      {
        word: 'vigilant',
        definition: 'Always being careful to notice possible dangers or difficulties.',
        phonetic: '/ˈvɪdʒ.əl.ənt/',
        partOfSpeech: 'adjective',
      },
    ],
    questions: [
      {
        id: 'q1',
        question: 'What is the primary message conveyed in the first paragraph?',
        options: [
          'AI has become an invisible, ubiquitous part of everyday routine.',
          'AI will soon completely replace human navigation systems.',
          'AI remains strictly theoretical within research laboratories.',
          'Predictive text is the only practical application of machine learning.',
        ],
        correctIndex: 0,
        explanation: 'The passage opens by noting that AI has quietly integrated into our mundane routines, handling text, navigation, and data analysis in everyday contexts.',
      },
      {
        id: 'q2',
        question: 'Why do algorithms inherit subtle prejudices, according to the author?',
        options: [
          'Computers inherently prefer certain groups over others.',
          'They are trained on historical data that already contains human biases.',
          'Software developers intentionally write biased algorithms.',
          'Hardware limitations prevent neutral computations.',
        ],
        correctIndex: 1,
        explanation: 'Paragraph 2 highlights that "When an algorithm is trained on historical data, it inevitably inherits the subtle prejudices embedded within human history."',
      },
      {
        id: 'q3',
        question: 'What does the word "mundane" in the first paragraph most closely mean?',
        options: [
          'Extremely thrilling and fast-paced',
          'Ordinary, everyday, and unremarkable',
          'Mysterious and unknown',
          'Dangerous and volatile',
        ],
        correctIndex: 1,
        explanation: '"Mundane" denotes typical, ordinary, or day-to-day matters.',
      },
      {
        id: 'q4',
        question: 'According to the final paragraph, who will thrive in the future digital landscape?',
        options: [
          'Those who reject all artificial intelligence tools completely.',
          'Those who blindly accept all computer recommendations without thought.',
          'Those who practice critical thinking and collaborate effectively with AI.',
          'Only software developers and computer scientists.',
        ],
        correctIndex: 2,
        explanation: 'The conclusion states that the future belongs to those who cultivate digital literacy and learn to collaborate harmoniously with intelligent technologies.',
      },
    ],
  },
  {
    id: 'pass-b1-coffee',
    title: 'The Global Journey of Coffee',
    level: 'B1',
    topic: 'Culture & History',
    wordCount: 240,
    estimatedMinutes: 2,
    content: `Every morning, hundreds of millions of people around the world start their day with a steaming cup of coffee. Yet few pause to consider the fascinating history behind this dark, aromatic brew. Legend has it that coffee was first discovered in the ninth century by an Ethiopian goat herder named Kaldi, who noticed that his goats became energetic after eating red berries from a certain bush.

From Ethiopia, coffee traveled across the Red Sea to Yemen, where monks boiled the beans to stay awake during nocturnal prayers. By the sixteenth century, vibrant coffeehouses flourished in Istanbul, Cairo, and Damascus. These establishments became lively social hubs where scholars, artists, and merchants met to debate philosophy and politics.

Today, coffee is one of the world's most traded agricultural commodities. From small farms in Colombia and Vietnam to trendy cafes in Tokyo and London, this humble bean has woven itself into the fabric of global culture.`,
    vocabulary: [
      {
        word: 'aromatic',
        definition: 'Having a pleasant and distinctive smell.',
        phonetic: '/ˌær.əˈmæt.ɪk/',
        partOfSpeech: 'adjective',
      },
      {
        word: 'flourished',
        definition: 'Grew or developed in a healthy or vigorous way.',
        phonetic: '/ˈflʌr.ɪʃt/',
        partOfSpeech: 'verb (past)',
      },
      {
        word: 'commodities',
        definition: 'Raw materials or primary agricultural products that can be bought and sold.',
        phonetic: '/kəˈmɒd.ə.tiz/',
        partOfSpeech: 'noun (plural)',
      },
    ],
    questions: [
      {
        id: 'q1',
        question: 'Who reportedly first observed the energizing effects of coffee berries?',
        options: [
          'An Ethiopian goat herder named Kaldi',
          'A Turkish merchant in Istanbul',
          'A group of monks in Yemen',
          'European explorers in Colombia',
        ],
        correctIndex: 0,
        explanation: 'The legend credits Kaldi, an Ethiopian goat herder, who noticed his goats became energetic.',
      },
      {
        id: 'q2',
        question: 'What role did sixteenth-century coffeehouses serve in cities like Istanbul and Cairo?',
        options: [
          'Solely silent religious prayer spaces',
          'Lively social and intellectual meeting grounds',
          'Medical clinics for tired soldiers',
          'Government trading exchanges only',
        ],
        correctIndex: 1,
        explanation: 'They were lively social hubs where scholars, artists, and merchants gathered to debate philosophy and politics.',
      },
    ],
  },
  {
    id: 'pass-c1-psych',
    title: 'The Architecture of Human Heuristics',
    level: 'C1',
    topic: 'Psychology & Neuroscience',
    wordCount: 350,
    estimatedMinutes: 4,
    content: `Human rationality is famously bounded. When confronted with labyrinthine decisions under conditions of acute ambiguity, the cognitive apparatus relies on evolutionary mental shortcuts known as heuristics. While these cognitive algorithms confer distinct survival advantages by conserving metabolic energy and expediting rapid choices, they systematically deviate from formal normative logic.

Consider the availability heuristic: agents disproportionately calibrate probability estimates based on the ease with which vivid exemplars can be retrieved from memory. A salient plane crash broadcast across sensationalist media triggers an irrational inflation of perceived flight hazards, completely eclipse the statistically substantiated safety of aviation compared to terrestrial transit.

Similarly, confirmation bias reinforces entrenched dogmas by impelling individuals to selectively assimilate congruent evidence while summarily dismissing dissonant empirical data. In contemporary hyper-connected information ecosystems, algorithmic echo chambers exacerbate this epistemic insulation. Consequently, debiasing cognitive architecture requires not merely raw intelligence, but deliberate metacognition—the discipline of rigorously scrutinizing one\'s own inferential mechanisms.`,
    vocabulary: [
      {
        word: 'labyrinthine',
        definition: 'Complicated and confusing, like a labyrinth or maze.',
        phonetic: '/ˌlæb.əˈrɪn.θaɪn/',
        partOfSpeech: 'adjective',
      },
      {
        word: 'heuristics',
        definition: 'Practical methods or mental shortcuts used to solve problems or make decisions quickly.',
        phonetic: '/hjuˈrɪs.tɪks/',
        partOfSpeech: 'noun (plural)',
      },
      {
        word: 'salient',
        definition: 'Most noticeable or important; prominent.',
        phonetic: '/ˈseɪ.li.ənt/',
        partOfSpeech: 'adjective',
      },
      {
        word: 'epistemic',
        definition: 'Relating to knowledge or the degree of its validation.',
        phonetic: '/ˌep.ɪˈstem.ɪk/',
        partOfSpeech: 'adjective',
      },
      {
        word: 'metacognition',
        definition: 'Awareness and understanding of one\'s own thought processes.',
        phonetic: '/ˌmet.ə.kɒɡˈnɪʃ.ən/',
        partOfSpeech: 'noun',
      },
    ],
    questions: [
      {
        id: 'q1',
        question: 'What is the primary evolutionary advantage of heuristics discussed in the text?',
        options: [
          'They ensure mathematically optimal statistical outcomes in every circumstance.',
          'They conserve cognitive energy and enable swift decision-making.',
          'They eliminate the need for emotional processing in the brain.',
          'They prevent media sensationalism from influencing rational choices.',
        ],
        correctIndex: 1,
        explanation: 'The author notes heuristics "confer distinct survival advantages by conserving metabolic energy and expediting rapid choices".',
      },
      {
        id: 'q2',
        question: 'How does the availability heuristic bias our assessment of risk?',
        options: [
          'By causing us to rely exclusively on actuarial charts.',
          'By overweighting vivid, memorable incidents over factual statistical probabilities.',
          'By suppressing emotional memories during emergencies.',
          'By forcing us to confirm the majority consensus.',
        ],
        correctIndex: 1,
        explanation: 'People estimate likelihood based on how easily vivid exemplars (like a publicized crash) can be recalled from memory.',
      },
    ],
  },
];

export const SAMPLE_WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: 'wp-ielts-1',
    category: 'IELTS Task 2',
    level: 'B2',
    title: 'Technology and Human Connection',
    prompt: `Some people believe that modern communication technology (such as messaging apps and social networks) has brought people closer together. Others argue that it has made human relationships more superficial and isolated.

Discuss both views and give your own reasoned opinion. Support your answer with relevant examples and explanations.`,
    targetWordCount: 250,
  },
  {
    id: 'wp-email-1',
    category: 'Business Email',
    level: 'B1',
    title: 'Requesting a Project Deadline Extension',
    prompt: `You are leading a cross-functional project. Due to unforeseen logistical challenges and additional scope requested by the client, you need a 10-day extension on your upcoming milestone.

Write a formal email to your VP of Operations (Ms. Katherine Vance) explaining:
1. The current status of the deliverables.
2. The specific rationale for requesting the extension.
3. The revised schedule and how you will guarantee quality upon delivery.`,
    targetWordCount: 150,
  },
  {
    id: 'wp-opinion-1',
    category: 'Opinion Essay',
    level: 'C1',
    title: 'The Ethics of Remote Work and City Planning',
    prompt: `The widespread permanence of remote and hybrid work models is reshaping metropolitan centers, draining commercial real estate demand while revitalizing suburban communities.

To what extent do municipal governments have a responsibility to adapt urban spaces to this paradigm shift? Present a well-structured argument outlining economic and social ramifications.`,
    targetWordCount: 280,
  },
  {
    id: 'wp-journal-1',
    category: 'Daily Journal',
    level: 'A2',
    title: 'A Memory That Changed My Perspective',
    prompt: `Reflect on a memorable experience or trip that changed the way you view the world. Describe where you were, who you met, what happened, and what valuable lesson you took away from that moment.`,
    targetWordCount: 120,
  },
];

export const SAMPLE_LISTENING_EXERCISES: ListeningExercise[] = [
  {
    id: 'listen-1',
    title: 'Artisan Bakery Consultation',
    level: 'B1',
    accent: 'UK',
    category: 'Conversation',
    dialogue: [
      { speaker: 'Baker', text: 'Good morning! Welcome to St. Jude’s Bakehouse. What can I tempt you with today?' },
      { speaker: 'Customer', text: 'Hi! I’m hosting a dinner party tonight with six guests, and I’m looking for a hearty sourdough loaf and perhaps something sweet for dessert.' },
      { speaker: 'Baker', text: 'Splendid! I’d highly recommend our dark rye sourdough. It has a crisp crust and a delightfully tangy crumb that pairs wonderfully with roast dishes.' },
      { speaker: 'Customer', text: 'That sounds marvellous. And what would you suggest for dessert?' },
      { speaker: 'Baker', text: 'Our cardamom raspberry tarts were taken fresh out of the oven just twenty minutes ago. They’re still slightly warm!' },
      { speaker: 'Customer', text: 'Terrific, I’ll take one sourdough loaf and half a dozen raspberry tarts, please.' },
    ],
    dictationSentences: [
      {
        sentence: 'What can I tempt you with today?',
        hint: 'A polite phrase used by shopkeepers to ask what you would like to purchase.',
      },
      {
        sentence: 'It has a crisp crust and a delightfully tangy crumb.',
        hint: 'Describing the outer and inner texture of artisanal bread.',
      },
      {
        sentence: 'Our cardamom raspberry tarts were taken fresh out of the oven.',
        hint: 'Refers to freshly baked sweet pastries.',
      },
    ],
    questions: [
      {
        id: 'lq1',
        question: 'Why is the customer purchasing bread and desserts?',
        options: [
          'For a business breakfast meeting',
          'For a dinner party with six guests',
          'To take on a long hiking picnic',
          'For an outdoor wedding reception',
        ],
        correctIndex: 1,
        explanation: 'The customer explicitly states: "I’m hosting a dinner party tonight with six guests".',
      },
      {
        id: 'lq2',
        question: 'When were the cardamom raspberry tarts taken out of the oven?',
        options: [
          'Yesterday afternoon',
          'Early this morning at dawn',
          'Just twenty minutes ago',
          'They have not been baked yet',
        ],
        correctIndex: 2,
        explanation: 'The baker says they "were taken fresh out of the oven just twenty minutes ago".',
      },
    ],
  },
  {
    id: 'listen-2',
    title: 'Product Design Sprint Review',
    level: 'B2',
    accent: 'US',
    category: 'Conversation',
    dialogue: [
      { speaker: 'Elena (Lead Designer)', text: 'Thanks for gathering, team. Let’s walk through the prototype feedback we collected from our usability tests on Tuesday.' },
      { speaker: 'Marcus (Engineer)', text: 'Sure Elena. Did the new navigation drawer solve the drop-off issues on mobile devices?' },
      { speaker: 'Elena (Lead Designer)', text: 'Remarkably well, actually. Task completion rates surged by forty-two percent, and user friction around the checkout flow was virtually eliminated.' },
      { speaker: 'Marcus (Engineer)', text: 'That is tremendous news. Are there any edge cases that caused accessibility bottlenecks?' },
      { speaker: 'Elena (Lead Designer)', text: 'Only in the contrast ratio of the secondary buttons when viewed under direct sunlight. We’ll adjust the hex codes to ensure WCAG AAA compliance before shipping.' },
    ],
    dictationSentences: [
      {
        sentence: 'Task completion rates surged by forty-two percent.',
        hint: 'A business metric indicating a dramatic increase in user success.',
      },
      {
        sentence: 'We will adjust the hex codes to ensure compliance before shipping.',
        hint: 'A technical commitment to accessibility standards.',
      },
    ],
    questions: [
      {
        id: 'lq1',
        question: 'By how much did task completion rates surge on mobile devices?',
        options: ['12 percent', '25 percent', '42 percent', '60 percent'],
        correctIndex: 2,
        explanation: 'Elena confirms: "Task completion rates surged by forty-two percent".',
      },
    ],
  },
];

export const SAMPLE_PRONUNCIATION_CHALLENGES: PronunciationChallenge[] = [
  {
    id: 'pron-1',
    text: 'Throughout thirty thoughtful theories, the author thoroughly thrives.',
    phoneticFocus: 'Voiceless /θ/ vs Voiced /ð/ Dental Fricatives',
    level: 'B2',
    tips: 'Place the tip of your tongue lightly between your top and bottom teeth. Release air gently for voiceless /θ/ (thoughtful), and vibrate your vocal cords for voiced /ð/ (the, author).',
  },
  {
    id: 'pron-2',
    text: 'Red lorry, yellow lorry, rolling rapidly down rural roads.',
    phoneticFocus: 'Liquid Consonants /r/ vs /l/',
    level: 'B1',
    tips: 'For /l/, the tip of your tongue touches the ridge behind your upper front teeth. For /r/, curl the tongue slightly backward without letting it touch the roof of the mouth.',
  },
  {
    id: 'pron-3',
    text: 'Victor visited various vibrant villages with valuable vintage velvet.',
    phoneticFocus: 'Labiodental Fricative /v/ vs Bilabial /w/',
    level: 'B1',
    tips: 'For /v/, touch your upper front teeth gently to your lower lip and vibrate your vocal cords. Do not round your lips as you would for /w/.',
  },
  {
    id: 'pron-4',
    text: 'She sells sea shells by the sunny seashore, where ships shine.',
    phoneticFocus: 'Sibilants /s/ vs Post-Alveolar /ʃ/',
    level: 'A2',
    tips: 'For /s/, keep tongue near alveolar ridge. For /ʃ/ (sh), pucker your lips slightly and pull tongue back.',
  },
  {
    id: 'pron-5',
    text: 'Particularly persistent participants properly prioritized productivity.',
    phoneticFocus: 'Multi-syllable rhythm & stress timing',
    level: 'C1',
    tips: 'Pay attention to primary stress syllables (par-TIC-u-lar-ly, per-SIS-tent). Keep unstressed vowels short (schwa /ə/).',
  },
];

export const SAMPLE_SPEAKING_SCENARIOS: SpeakingScenario[] = [
  {
    id: 'scen-cafe',
    role: 'Customer',
    partnerRole: 'Friendly Barista (Sam)',
    level: 'B1',
    scenario: 'You are ordering coffee and breakfast at a bustling cafe in central London.',
    initialMessage: 'Hi there! Welcome to The Corner Bean. What can I get started for you today?',
    suggestedPhrases: [
      'Could I please have an oat flat white and an almond croissant?',
      'Is there an extra charge for alternative milk?',
      'Could I have that to go, please?',
      'Do you have any vegan pastry options available?',
    ],
  },
  {
    id: 'scen-interview',
    role: 'Job Candidate',
    partnerRole: 'Senior Hiring Manager (David)',
    level: 'B2',
    scenario: 'You are in the first round of an interview for a project lead role at an international tech company.',
    initialMessage: 'Thanks for taking the time to speak with us today. To begin, could you introduce yourself and describe a challenging project you successfully navigated?',
    suggestedPhrases: [
      'Certainly. Over the past three years, I have specialized in managing cross-functional initiatives...',
      'One notable project involved coordinating across four different time zones...',
      'My approach was to establish weekly asynchronous check-ins to streamline communication.',
      'Could you tell me more about the team’s current strategic priorities?',
    ],
  },
  {
    id: 'scen-customs',
    role: 'International Traveler',
    partnerRole: 'Border Control Officer (Agent Miller)',
    level: 'B1',
    scenario: 'You have just landed at Heathrow Airport and are passing through passport inspection.',
    initialMessage: 'Good afternoon. Passport and landing card, please. What is the primary purpose of your visit to the United Kingdom?',
    suggestedPhrases: [
      'Good afternoon, officer. Here are my documents. I am here for a ten-day holiday.',
      'I will be staying at a hotel near Paddington Station.',
      'I have a return flight booked for the fourteenth.',
      'I am traveling alone for tourism and sightseeing.',
    ],
  },
  {
    id: 'scen-debate',
    role: 'Debater',
    partnerRole: 'Debate Partner (Clara)',
    level: 'C1',
    scenario: 'You and a colleague are debating whether universities should make all degree lectures completely online and asynchronous.',
    initialMessage: 'I strongly believe universities should preserve compulsory in-person seminars. Without real-time spontaneous debate, critical pedagogical nuance is lost. What is your stance?',
    suggestedPhrases: [
      'While I acknowledge the value of physical proximity, asynchronous formats democratize access for working students.',
      'Research demonstrates that hybrid models yield superior retention rates when structured deliberately.',
      'We must differentiate between mass lectures, which benefit from digital flexibility, and intimate discussion seminars.',
      'How would you address the equity gap for students who cannot afford metropolitan accommodation?',
    ],
  },
];
