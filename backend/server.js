import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import DataLoader from "dataloader";

const tweets = [
  { id: 1, body: "Lorem Ipsum", date: new Date(), author_id: 10 },
  { id: 2, body: "Sic dolor amet", date: new Date(), author_id: 11 },
];
const authors = [
  {
    id: 10,
    username: "johndoe",
    first_name: "John",
    last_name: "Doe",
    avatar_url: "acme.com/avatars/10",
  },
  {
    id: 11,
    username: "janedoe",
    first_name: "Jane",
    last_name: "Doe",
    avatar_url: "acme.com/avatars/11",
  },
];
const stats = [
  { tweet_id: 1, views: 123, likes: 4, retweets: 1, responses: 0 },
  { tweet_id: 2, views: 567, likes: 45, retweets: 63, responses: 6 },
];

// Schema definition
const typeDefs = `#graphql
  type Tweet {
    id: ID!
    # The tweet text. No more than 140 characters!
    body: String
    # When the tweet was published
    date: Date
    # Who published the tweet
    Author: User
    # Views, retweets, likes, etc
    Stats: Stat
  }

  type User {
    id: ID!
    username: String
    first_name: String
    last_name: String
    full_name: String
    name: String @deprecated
    avatar_url: Url
  }

  type Stat {
    views: Int
    likes: Int
    retweets: Int
    responses: Int
  }

  type Notification {
    id: ID
    date: Date
    type: String
  }

  type Meta {
    count: Int
  }

  scalar Url
  scalar Date

  type Query {
    Tweet(id: ID!): Tweet
    Tweets(limit: Int, sortField: String, sortOrder: String): [Tweet]
    TweetsMeta: Meta
    User: User
    Notifications(limit: Int): [Notification]
    NotificationsMeta: Meta
  }

  type Mutation {
    createTweet(body: String, author_id: ID!): Tweet
    deleteTweet(id: ID!): Tweet
    markTweetRead(id: ID!): Boolean
  }
`;

// Simulated asynchronous function to fetch user data by ID
const batchUsersById = async (ids) => {
  console.log("Fetching users by IDs:", ids);
  return ids.map((id) => authors.find((user) => user.id === id));
};

// Create a DataLoader instance for batch loading users by ID
const userLoader = new DataLoader(batchUsersById);

const resolvers = {
  Query: {
    Tweets: () => tweets,
    Tweet: (_, { id }) => tweets.find((tweet) => tweet.id == id),
  },
  Tweet: {
    Author: (tweet, _, context) => {
      //   console.log(`context.dataloaders is ${context.dataloaders}`);
      return authors.find((author) => author.id == tweet.author_id);
      //   return userLoader.load(tweet.author_id);
    },
    Stats: (tweet) => stats.find((stat) => stat.tweet_id == tweet.id),
  },
  User: {
    full_name: (author) => `${author.first_name} ${author.last_name}`,
  },
  Mutation: {
    createTweet: (_, { body, author_id }) => {
      const nextTweetId =
        tweets.reduce((id, tweet) => {
          return Math.max(id, tweet.id);
        }, -1) + 1;
      const newTweet = {
        id: nextTweetId,
        date: new Date(),
        author_id,
        body,
      };
      tweets.push(newTweet);
      return newTweet;
    },
  },
};

// Pass schema definition and resolvers to the
// ApolloServer constructor
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Launch the server
const { url } = await startStandaloneServer(server);

console.log(`🚀 Server listening at: ${url}`);
