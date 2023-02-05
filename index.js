import { ApolloServer, gql } from "apollo-server";
// import dayjs from "dayjs";

//dotenv 사용법
// 1) 임포트해준다. dotenv
// 2) config(); 로 닷엔브 켜주고 적용시켜야 한다.
import dotenv from "dotenv";
dotenv.config();
/**
 * 오늘 날짜 가져오기
 * day.js
 * format YYYYMMDD or YYYY-MM-DD
 * hour get(hour)-1 (결과발표 시관 관련)
 */
// const today = dayjs().format("YYYYMMDD");
// const todayFormatDash = dayjs().format("YYYY-MM-DD");
// const currentHour = dayjs().get("hour") - 1;
// console.log(today);
// console.log(todayFormatDash);

const MY_API_KEY = process.env.API_KEY;

//미세먼지 기본 패쓰
const DUST_PATH_BASIC = "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc";

//측정소별 실시간 미세먼지 데이터
const DUST_URL = "/getCtprvnRltmMesureDnsty";

//아폴로 서버를 생성할 때 넣어줘야하는 타입정의
//GET 기능을 수행하는 필드는 type Query{ }
//POST,DELETE,PUT 등 db의 변화(수정) 기능을 수행하는 필드는 type Mutation{ }

const typeDefs = gql`
  # 반드시 Query라는 타입을 정의해야함.

  type Dust {
    id: String
    stationName: String
    dataTime: String
    pm10Grade: String
    pm10Grade1h: String
    pm10Value: String
    pm10Value24: String
    pm25Grade1h: String
    pm25Value: String
    pm25Value24: String
    pm25Grade: String
    khaiGrade: String
    khaiValue: String
    sidoName: String
  }

  type Query {
    allDusts: [Dust]
    dust(stationName: String!): Dust
  }
`;

//Resolver=해결하다

const resolvers = {
  Query: {
    allDusts() {
      return fetch(
        `${DUST_PATH_BASIC}${DUST_URL}?serviceKey=${MY_API_KEY}&numOfRows=100&returnType=json&ver=1.3&sidoName=${encodeURIComponent(
          "강원"
        )}`
      )
        .then((response) => response.json())
        .then((r) => r.response.body.items)
        .then((result) =>
          result.map((item, index) => ({ id: index + 1, ...item }))
        );
    },
    dust(_, { stationName }) {
      return fetch(
        `${DUST_PATH_BASIC}${DUST_URL}?serviceKey=${MY_API_KEY}&numOfRows=100&returnType=json&ver=1.3&sidoName=${encodeURIComponent(
          "강원"
        )}`
      )
        .then((response) => response.json())
        .then((r) => r.response.body.items)
        .then((result) =>
          result.map((item, index) => ({ id: (index + 1).toString(), ...item }))
        )
        .then((r) => {
          const result = r.find((item) => item.stationName === stationName);
          console.log(typeof result.id);
          console.log(result);
          return result;
        });
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
  introspection: true,
  playground: true,
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Running on ${url}`);
});
