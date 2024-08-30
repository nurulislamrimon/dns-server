const dgram = require("dgram");
const dnsPacket = require("dns-packet");
const server = dgram.createSocket("udp4");

server.on("error", (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});

// server.on("message", (msg, rinfo) => {
//   console.log(`server got: ${msg.toString()} from ${{rinfo}}.`);
// });

const myDb = {
  "expertsquad.net": "198.175.150.9",
  "theqprint.com": "62.171.145.157",
};

server.on("message", (message, rInfo) => {
  const incomingReq = dnsPacket.decode(message);
  const questions = incomingReq.questions;
  const resolvedIP = myDb[questions?.[0]?.name];

  const ans = dnsPacket.encode({
    type: "response",
    id: incomingReq.id,
    flags: dnsPacket.AUTHORITATIVE_ANSWER,
    questions: questions,
    answers: [
      {
        type: "A",
        class: "IN",
        name: questions?.[0]?.name,
        data: resolvedIP,
      },
    ],
  });

  server.send(ans, rInfo.port, rInfo.address);

  console.log(questions, rInfo, resolvedIP); // prints out a response from google dns
});

server.on("listening", () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(5353, () => {
  console.log("DNS server is running on port : 5353");
});
