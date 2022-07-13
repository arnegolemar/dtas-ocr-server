const Voucher = require('../../models/Voucher');

function DateDifference (startP, endP, voucherId, io) {
  const start = new Date(`${startP.date} ${startP.time}:00.000`);
  const end   = new Date(`${endP.date} ${endP.time}:00.000`);
  const now   = new Date();

  const startT = start.getTime();
  const endT   = end.getTime();
  const nowT   = now.getTime();

  console.log("====================" + voucherId + " OPEN ====================");
  console.log("start  ->>>  " + start);
  console.log("end    ->>>  " + end);
  console.log("now    ->>>  " + now);
  console.log("startT ->>>  " + startT);
  console.log("endT   ->>>  " + endT);
  console.log("nowT   ->>>  " + nowT);
  console.log("====================" + voucherId + " CLOSE ====================");

  const voucherValidity  = endT - startT;
  const voucherStartTime = startT - nowT;

  const voucherTrigger = setTimeout(() => {
    const now1   = new Date();

    console.log("VOUCHER START --->  " + voucherId + " -------> " + now1);

    io.of("/admin").emit("voucher-status", {voucherId: voucherId, status: "ongoing"});

    Voucher
      .findById(voucherId, (err, voucher) => {
        voucher.status = "ongoing";
        voucher.save();
      })
      .then()
      .catch(err => {
        console.log("VOUCHER ERROR ID: " + voucherId);
      });


    const voucherTime = setTimeout(() => {
      const now2   = new Date();
      console.log("VOUCHER END   --->  " + voucherId + " -------> " + now2);

      io.of("/admin").emit("voucher-status", {voucherId: voucherId, status: "expired"});
      Voucher
        .findById(voucherId, (err, voucher) => {
          voucher.status = "expired";
          voucher.save();
        })
        .then()
        .catch(err => {
          console.log("VOOUCHER ERROR ID: " + voucherId);
        });

      clearTimeout(voucherTime);
    }, voucherValidity);

    clearTimeout(voucherTrigger);

  }, voucherStartTime);

}

// DateDifference({date: "2019-03-15", time: "14:00"}, {date: "2019-03-15", time: "14:02"}, "5c8b227046abad098cff80e9");
// DateDifference({date: "2019-03-13", time: "10:33"}, {date: "2019-03-13", time: "11:05"}, "141-00172");
// DateDifference({date: "2019-03-13", time: "11:02"}, {date: "2019-03-13", time: "12:07"}, "141-00173");
// DateDifference({date: "2019-03-13", time: "11:30"}, {date: "2019-03-13", time: "13:03"}, "141-00174");

module.exports = {
	DateDifference
}
