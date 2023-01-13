import { ApolloServer, gql } from "apollo-server";
import dayjs from "dayjs";

/**
 * 오늘 날짜 가져오기
 * day.js
 * format YYYYMMDD or YYYY-MM-DD
 * hour get(hour)-1 (결과발표 시관 관련)
 */
const today = dayjs().format("YYYYMMDD");
const todayFormatDash = dayjs().format("YYYY-MM-DD");
const currentHour = dayjs().get("hour") - 1;
console.log(today);
console.log(todayFormatDash);

const API_KEY =
  "l72zwz6RqrexXr8a4wslQsw%2Bx0zTGnE5R1sSf26aPRPOQytFjk3AkCOTfssOo1TQ8xQoimJbfkfYL6YZr%2FssIw%3D%3D";
//미세먼지 기본 패쓰
const DUST_PATH_BASIC = "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc";

//측정소별 실시간 미세먼지 데이터
const DUST_URL = "/getCtprvnRltmMesureDnsty";

let tweets = [
  {
    id: "1",
    text: "hello",
    userId: "2",
  },
  {
    id: "2",
    text: "bye",
    userId: "3",
  },
  {
    id: "3",
    text: "hohoho",
    userId: "4",
  },
  {
    id: "4",
    text: "long",
    userId: "5",
  },
  {
    id: "5",
    text: "dragon",
    userId: "1",
  },
];

let users = [
  {
    id: "1",
    firstName: "nico",
    lastName: "sevroans",
  },
  {
    id: "2",
    firstName: "jaden",
    lastName: "iteach12",
  },
  {
    id: "3",
    firstName: "grade",
    lastName: "griteach",
  },
];

//아폴로 서버를 생성할 때 넣어줘야하는 타입정의
//GET 기능을 수행하는 필드는 type Query{ }
//POST,DELETE,PUT 등 db의 변화(수정) 기능을 수행하는 필드는 type Mutation{ }

const typeDefs = gql`
  # 반드시 Query라는 타입을 정의해야함.

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    """
    Is the sum of firstName + lastName as a String
    """
    fullName: String!
  }
  """
  Tweet object of what ever i write
  """
  type Tweet {
    id: ID!
    text: String!
    author: User
  }

  type Dust {
    id: ID
    stationName: String
    dataTime: String
    pm10Grade: String
    pm10Grade1h: String
    pm10Value: String
    pm10Value24: String
  }

  type Query {
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    allDusts: [Dust!]!
    dust(stationName: String!): Dust
  }

  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet

    """
    Deletes a Tweet if found, else returns false
    """
    deleteTweet(id: ID!): Boolean!
  }
`;

//Resolver=해결하다

const resolvers = {
  Query: {
    allTweets() {
      return tweets;
    },
    tweet(root, { id }) {
      return tweets.find((tweet) => tweet.id === id);
    },
    allUsers() {
      return users;
    },

    allDusts() {
      return fetch(
        `${DUST_PATH_BASIC}${DUST_URL}?serviceKey=${API_KEY}&numOfRows=100&returnType=json&ver=1.3&sidoName=${encodeURIComponent(
          "강원"
        )}`
      )
        .then((response) => response.json())
        .then((r) => r.response.body.items);
    },
    dust(_, { stationName }) {
      return fetch(
        `${DUST_PATH_BASIC}${DUST_URL}?serviceKey=${API_KEY}&numOfRows=100&returnType=json&ver=1.3&sidoName=${encodeURIComponent(
          "강원"
        )}`
      )
        .then((response) => response.json())
        .then((r) =>
          r.response.body.items.find((item) => item.stationName === stationName)
        );
    },
  },
  Mutation: {
    postTweet(_, { text, userId }) {
      const vaildateOfUserId = tweets.find((tweet) => tweet.id === userId);

      if (!vaildateOfUserId) {
        console.log("해당하는 유저가 없습니다.");
        return false;
      }

      const newTweet = {
        id: tweets.length + 1,
        text,
        userId,
      };
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet(_, { id }) {
      //조건에 맞는 녀석을 하나 찾아본다.
      const myTweet = tweets.find((tweet) => tweet.id === id);

      //조건에 맞는 것이 없다? 그러면 false반환
      if (!myTweet) return false;

      //새로운 tweets(배열)를 만들건데
      //tweets를 필터로 돌려서 조건에 안맞는 녀석들만 다시 새롭게 저장한다.
      //이렇게 하면 우리가 요구한 조건에 맞는 녀석은 다시 저장되지 않으니까
      //지워진다고 봐야지.
      tweets = tweets.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  User: {
    fullName({ firstName, lastName }) {
      return `${firstName} ${lastName}`;
    },
  },
  Tweet: {
    author({ userId }) {
      return users.find((user) => user.id === userId);
    },
  },
};

//아폴로 서버를 생성할 때 typeDefs(타입정의)를 넣어줘야 제대로 생성된다.
const server = new ApolloServer({
  cors: {
    origin: "*",
  },
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
