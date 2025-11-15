import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "CMA APP",
    description: "Auto-generated Swagger documentation for CMA APP",
  },
  host: "localhost:3000",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./server.js"]; // bisa juga ["./routes/*.js"]

swaggerAutogen()(outputFile, endpointsFiles, doc);
