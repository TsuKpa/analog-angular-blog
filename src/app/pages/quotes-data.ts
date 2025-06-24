export interface Quote {
  text: string;
  author: string;
  profession?: string;
}

export const quotes: Quote[] = [
  {
    text: "If it works, don't touch it",
    author: "Nobody",
    profession: "Software Engineer"
  },
  {
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay",
    profession: "Computer Scientist"
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    profession: "Software Engineer"
  },
  {
    text: "The only way to learn a new programming language is by writing programs in it.",
    author: "Dennis Ritchie",
    profession: "Computer Scientist"
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    profession: "Programmer"
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
    profession: "Software Developer"
  },
  {
    text: "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.",
    author: "Dan Salomon",
    profession: "Programmer"
  },
  {
    text: "It's not a bug – it's an undocumented feature.",
    author: "Anonymous",
    profession: "Programmer"
  },
  {
    text: "The most damaging phrase in the language is 'We've always done it this way.'",
    author: "Grace Hopper",
    profession: "Computer Scientist"
  },
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    profession: "Software Engineer"
  },
  {
    text: "Programming isn't about what you know; it's about what you can figure out.",
    author: "Chris Pine",
    profession: "Programmer"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    profession: "Entrepreneur"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    profession: "Entrepreneur"
  },
  {
    text: "The cloud is just someone else's computer.",
    author: "Anonymous",
    profession: "Developer"
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    profession: "Artist & Inventor"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    profession: "Former First Lady"
  },
  {
    text: "Technology is best when it brings people together.",
    author: "Matt Mullenweg",
    profession: "Entrepreneur"
  },
  {
    text: "The Internet is not just one thing, it's a collection of things – of numerous communications networks that all speak the same digital language.",
    author: "Tim Berners-Lee",
    profession: "Computer Scientist"
  },
  {
    text: "The advance of technology is based on making it fit in so that you don't really even notice it, so it's part of everyday life.",
    author: "Bill Gates",
    profession: "Entrepreneur"
  },
  {
    text: "The computer was born to solve problems that did not exist before.",
    author: "Bill Gates",
    profession: "Entrepreneur"
  },
  {
    text: "The most important single aspect of software development is to be clear about what you are trying to build.",
    author: "Bjarne Stroustrup",
    profession: "Computer Scientist"
  }
];

export function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}
