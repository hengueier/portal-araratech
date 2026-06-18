import * as utility from "../../../helper/utility";
import * as chart from "../../../helper/chart";
import { schema } from "../Account/Account";
import { FilterQuery, Document } from 'mongoose';

const Account = schema;

interface AccountDocument extends Document {
  date_created: Date;
}

export const accounts = async function (filter?: FilterQuery<AccountDocument>): Promise<number> {
  return Account.countDocuments(filter);
};

export const growth = async function (): Promise<any> {
  let chartData: { label: string, value: number }[] = [];

  const data = await Account.aggregate([
    {
      $group: {
        _id: { $month: "$date_created" },
        total: { $sum: 1 },
      },
    },
  ]);

  if (data?.length) {
    data.forEach((month: { _id: number, total: number }) => {
      chartData.push({
        label: utility.convertToMonthName(month._id),
        value: month.total,
      });
    });
  }

  return chart.create(chartData, "Signups");
};