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
  "expertsquad.net": { type: "A", data: "198.175.150.9" },
  "theqprint.com": { type: "A", data: "62.171.145.157:3000" },
  "test.theqprint.com": { type: "CNAME", data: "theqprint.com" },
};

server.on("message", (message, rInfo) => {
  const incomingReq = dnsPacket.decode(message);
  const questions = incomingReq.questions;
  const resolvedAddress = myDb[questions?.[0]?.name];

  const ans = dnsPacket.encode({
    type: "response",
    id: incomingReq.id,
    flags: dnsPacket.AUTHORITATIVE_ANSWER,
    questions: questions,
    answers: [
      {
        type: resolvedAddress?.type,
        class: "IN",
        name: questions?.[0]?.name,
        data: resolvedAddress?.data,
      },
    ],
  });

  console.log(questions, rInfo, resolvedAddress, {
    type: resolvedAddress?.type,
    class: "IN",
    name: questions?.[0]?.name,
    data: resolvedAddress?.data,
  }); // prints out a response from google dns

  server.send(ans, rInfo.port, rInfo.address);
});

server.on("listening", () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(5353, () => {
  console.log("DNS server is running on port : 5353");
});
