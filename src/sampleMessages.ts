interface ISampleMessage {
  title: string;
  content: string;
  received: string;
}

export const sampleMessages: ISampleMessage[] = [
  {
    title: "Message from User123",
    content: "Hey! How are you doing today?",
    received: "12 minutes ago",
  },
  {
    title: "Message from StrangerUser",
    content: "I really liked your recent post!",
    received: "1 hour ago",
  },
  {
    title: "Message from GuestUser",
    content: "What books do you recommend for JEE preparation",
    received: "3 hours ago",
  },
];
