const Passenger = require('../../models/Passenger');
const Voucher = require('../../models/Voucher');

function GetVoucherStatus (id){
  Voucher
    .findById(id)
    .select(["status", "-_id"])
    .then(status => {
      return status;
    });
}

function RemoveExpiredVoucher (id) {
  // console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
  Passenger
    .updateMany(
      {},
      {$pull: {'voucher': {'id':id}}}
    )
    .then(() => {
      // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    })
    .catch(err => {
      // console.log(err);
    });
}

function DistributeVoucher (voucher, id){
  var cond = {};
  // if (val == "noOfBookings"){
  //
  // }
  Passenger.updateMany(
    cond,
    {
      $push: {
        voucher : {
          id: id,
          count: 1
        }
      }
    }
  ).then().catch(err => res.json({err:err}));
}

function VoucherTimeout (voucher, voucherId, io) {
  const start = new Date(`${voucher.validity.start.date} ${voucher.validity.start.time}:00.000`);
  const end   = new Date(`${voucher.validity.end.date} ${voucher.validity.end.time}:00.000`);
  const now   = new Date(`${voucher.now.date} ${voucher.now.time}.000`);

  // console.log(voucher);
  // console.log(voucher);

  const startT = start.getTime();
  const endT   = end.getTime();
  const nowT   = now.getTime();
  // console.log(nowT);
  // console.log("====================" + voucherId + " OPEN ====================");
  // console.log("start  ->>>  " + start);
  // console.log("end    ->>>  " + end);
  // console.log("now    ->>>  " + now);
  // console.log("startT ->>>  " + startT);
  // console.log("endT   ->>>  " + endT);
  // console.log("nowT   ->>>  " + nowT);
  // console.log("====================" + voucherId + " CLOSE ====================");

  const voucherValidity  = endT - startT;
  const voucherStartTime = startT - nowT;

  const voucherTrigger = setTimeout(() => {
    const now1   = new Date();

    // console.log("VOUCHER START --->  " + voucherId + " -------> " + now1);
    // DistributeVoucher(voucher, voucherId);
    io.of("/admin").emit("voucher-status", {voucherId: voucherId, status: "ongoing"});

    Voucher
      .findById(voucherId, (err, voucher) => {
        voucher.status = "ongoing";
        voucher.save();
      })
      .then()
      .catch(err => {
        // console.log("VOUCHER ERROR ID: " + voucherId);
      });


    const voucherTime = setTimeout(() => {
      const now2   = new Date();
      // console.log("VOUCHER END   --->  " + voucherId + " -------> " + now2);

      RemoveExpiredVoucher(voucherId);

      io.of("/admin").emit("voucher-status", {voucherId: voucherId, status: "expired"});
      Voucher
        .findById(voucherId, (err, voucher) => {
          voucher.status = "expired";
          voucher.save();
        })
        .then()
        .catch(err => {
          // console.log("VOUCHER ERROR ID: " + voucherId);
        });

      clearTimeout(voucherTime);
    }, voucherValidity);

    clearTimeout(voucherTrigger);

  }, voucherStartTime);

}

// VoucherTimeout({date: "2019-03-15", time: "14:00"}, {date: "2019-03-15", time: "14:02"}, "5c8b227046abad098cff80e9");
// VoucherTimeout({date: "2019-03-13", time: "10:33"}, {date: "2019-03-13", time: "11:05"}, "141-00172");
// VoucherTimeout({date: "2019-03-13", time: "11:02"}, {date: "2019-03-13", time: "12:07"}, "141-00173");
// VoucherTimeout({date: "2019-03-13", time: "11:30"}, {date: "2019-03-13", time: "13:03"}, "141-00174");

module.exports = {
	VoucherTimeout,
  RemoveExpiredVoucher
}
