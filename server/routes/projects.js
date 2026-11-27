const express = require('express');
const router = express.Router();

const projects = [
  {
    name: 'cyberpunk-os',
    desc: 'Neural-interface OS: multi-window terminals, R3F 3D, Command Bus, multi-AI oracle.',
    tags: ['React', 'Three.js', 'TypeScript'],
    demo: 'https://github.com/Blikvibes1/cyberpunk-os',
    repo: 'https://github.com/Blikvibes1/cyberpunk-os'
  },
  {
    name: 'datavibes-gh',
    desc: 'Ghana data-bundle store: Next.js, Prisma, Paystack, Datamart, admin, webhooks.',
    tags: ['Next.js', 'Prisma', 'Paystack'],
    demo: '#',
    repo: '#'
  },
  {
    name: 'atelier-systems',
    desc: '30 advanced creative systems — generative, canvas, vanilla JS.',
    tags: ['Canvas', 'Vanilla JS'],
    demo: 'https://github.com/Blikvibes1/freelancer-development-roadmap/tree/main/advanced-creative-systems',
    repo: 'https://github.com/Blikvibes1/freelancer-development-roadmap'
  },
  {
    name: 'freelancer-roadmap',
    desc: 'Public week-by-week frontend skill builds.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    demo: 'https://github.com/Blikvibes1/freelancer-development-roadmap',
    repo: 'https://github.com/Blikvibes1/freelancer-development-roadmap'
  }
];

router.get('/', (_req, res) => {
  res.json({ projects });
});

module.exports = router;
