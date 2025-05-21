import { Request, Response, NextFunction } from "express";
import Invoice from "../models/invoice.model";
import Order from "../models/orderModel";
import { CustomError } from "../middlewares/error";
import { checkPermission } from "../helpers/authHelper";
import { sendAdminNewInvoiceEmail, sendInvoiceGeneratedEmail } from "../utils/mailer";

// Helper to generate invoice number
const generateInvoiceNumber = (orderNumber: string): string => {
  return `INV-${orderNumber}`;
};

// *********************************************************
// ******************* Create an invoice *******************
// *********************************************************
export const createInvoice = async (
  orderId: string,
  paymentMethod: string,
): Promise<string> => {
  const order = await Order.findById(orderId).populate("userId");
  if (!order) {
    throw new CustomError(404, "Order not found.");
  }

  // Check if invoice already exists
  const existingInvoice = await Invoice.findOne({ orderId });
  if (existingInvoice) {
    throw new CustomError(400, "Invoice already exists for this order.");
  }

  const invoiceNumber = generateInvoiceNumber(order.orderNumber);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

  const invoiceData = {
    invoiceNumber,
    orderId,
    userId: order.userId,
    totalAmount: order.totalPrice,
    discountAmount: order.couponDiscount,
    finalAmount: order.finalPrice,
    status: order.paymentStatus === "Paid" ? "Paid" : "Unpaid",
    dueDate,
    paymentMethod,
    paymentId: order.paymentId,
    zohoInvoiceId: order.zohoInvoiceId,
  };

  const newInvoice = new Invoice(invoiceData);
  await newInvoice.save();

  // Update order with invoiceNumber
  await Order.findByIdAndUpdate(orderId, { invoiceId: invoiceNumber });

  // Send emails asynchronously
  Promise.all([
    sendInvoiceGeneratedEmail(newInvoice._id.toString()),
    sendAdminNewInvoiceEmail(newInvoice._id.toString()),
  ]).catch((err) => console.error("Email sending failed:", err));

  return newInvoice._id.toString();
};

// *********************************************************
// ************ Update invoice payment status **************
// *********************************************************
export const updateInvoicePaymentStatus = async (
  orderId: string,
  paymentStatus: string
): Promise<void> => {
  const invoice = await Invoice.findOne({ orderId });
  if (invoice) {
    const newStatus = paymentStatus === "Paid" ? "Paid" : paymentStatus === "Cancelled" ? "Cancelled" : "Pending";
    await Invoice.findByIdAndUpdate(invoice._id, { status: newStatus });
  }
};

// *********************************************************
// ************** Delete invoice by orderId ****************
// *********************************************************
export const deleteInvoiceByOrderId = async (orderId: string): Promise<void> => {
  await Invoice.findOneAndDelete({ orderId });
};

// **************************************************************
// *** Get all invoices or specific invoice by number (Admin) ***
// **************************************************************
export const getInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { invoiceNumber } = req.query;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "invoices", 2);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    let invoices;
    if (invoiceNumber) {
      invoices = await Invoice.findOne({ invoiceNumber })
        .populate("userId", "-wishlist -orderHistory -refreshToken -createdAt -updatedAt -__v")
        .populate({
          path: "orderId",
          populate: {
            path: "products.product",
            populate: { path: "category", select: "name" },
          },
        })
        .lean();
      if (!invoices) {
        return res.status(404).json({ message: "Invoice not found." });
      }
    } else {
      invoices = await Invoice.find()
        .sort({ createdAt: -1 })
        .populate("userId", "-wishlist -orderHistory -refreshToken -createdAt -updatedAt -__v")
        .populate({
          path: "orderId",
          populate: {
            path: "products.product",
            populate: { path: "category", select: "name" },
          },
        })
        .lean();
    }

    res.status(200).json({ data: invoices });
  } catch (error) {
    next(new CustomError(500, error instanceof Error ? error.message : "An unknown error occurred."));
  }
};

// **************************************************************
// ********************** Update invoice (Admin) ****************
// **************************************************************
export const updateInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { invoiceId } = req.query;
    const updateData = req.body;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "invoices", 3);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(invoiceId, updateData, {
      new: true,
    });

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    res.status(200).json({ message: "Invoice updated successfully.", data: updatedInvoice });
  } catch (error) {
    next(new CustomError(500, error instanceof Error ? error.message : "An unknown error occurred."));
  }
};

// **************************************************************
// **************** Delete invoice by ID (Admin) ****************
// **************************************************************
export const deleteInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { invoiceId } = req.query;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "invoices", 4);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const deletedInvoice = await Invoice.findByIdAndDelete(invoiceId);
    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    // Remove invoiceId from associated order
    await Order.findOneAndUpdate(
      { invoiceId: deletedInvoice.invoiceNumber },
      { invoiceId: null }
    );

    res.status(200).json({ message: "Invoice deleted successfully." });
  } catch (error) {
    next(new CustomError(500, error instanceof Error ? error.message : "An unknown error occurred."));
  }
};

// **************************************************************
// ****************** Get invoices by user ID *******************
// **************************************************************
export const getInvoicesByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { invoiceNumber } = req.query;

    let invoices;
    if (invoiceNumber) {
      invoices = await Invoice.findOne({ userId, invoiceNumber })
        .populate({
          path: "orderId",
          populate: {
            path: "products.product",
            populate: { path: "category", model: "ProductCategory", select: "_id name" },
          },
        })
        .lean();
      if (!invoices) {
        return res.status(404).json({ message: "Invoice not found." });
      }
    } else {
      invoices = await Invoice.find({ userId })
        .populate({
          path: "orderId",
          populate: {
            path: "products.product",
            populate: { path: "category", model: "ProductCategory", select: "_id name" },
          },
        })
        .sort({ createdAt: -1 })
        .lean();
    }

    res.status(200).json({ data: invoices });
  } catch (error) {
    next(new CustomError(500, error instanceof Error ? error.message : "An unknown error occurred."));
  }
};

// **************************************************************
// ********** Get invoice statistics for dashboard **************
// **************************************************************
export const getInvoiceStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "invoices", 2);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const now = new Date();
    const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const prevMonthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
    const prevMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const todayStart = new Date(now).setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(now).setUTCHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const [stats] = await Invoice.aggregate([
      {
        $facet: {
          currentMonthInvoices: [
            { $match: { createdAt: { $gte: currentMonthStart, $lte: now } } },
            { $group: { _id: null, newInvoices: { $sum: 1 } } },
          ],
          previousMonthInvoices: [
            { $match: { createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
            {
              $group: {
                _id: null,
                newInvoices: { $sum: 1 },
                totalAmount: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$totalAmount", 0] } },
                finalAmount: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$finalAmount", 0] } },
              },
            },
          ],
          allTimeMetrics: [
            {
              $group: {
                _id: null,
                totalAmount: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$totalAmount", 0] } },
                finalAmount: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$finalAmount", 0] } },
                allInvoices: { $sum: 1 },
                paidInvoices: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, 1, 0] } },
                overdueInvoices: { $sum: { $cond: [{ $eq: ["$status", "Overdue"] }, 1, 0] } },
              },
            },
          ],
          dailyInvoices: [
            { $match: { createdAt: { $gte: new Date(todayStart), $lte: new Date(todayEnd) } } },
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
          chartData: [
            { $match: { createdAt: { $gte: sevenDaysAgo, $lte: new Date(todayEnd) } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                newInvoices: { $sum: 1 },
                totalAmount: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$totalAmount", 0] } },
                finalAmount: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$finalAmount", 0] } },
              },
            },
            { $project: { date: "$_id", newInvoices: 1, totalAmount: 1, finalAmount: 1, _id: 0 } },
            { $sort: { date: 1 } },
          ],
        },
      },
    ]);

    const currentMonthNewInvoices = stats.currentMonthInvoices[0]?.newInvoices || 0;
    const prevMonthNewInvoices = stats.previousMonthInvoices[0]?.newInvoices || 0;
    const prevMonthTotalAmount = stats.previousMonthInvoices[0]?.totalAmount || 0;
    const prevMonthFinalAmount = stats.previousMonthInvoices[0]?.finalAmount || 0;
    const allTimeTotalAmount = stats.allTimeMetrics[0]?.totalAmount || 0;
    const allTimeFinalAmount = stats.allTimeMetrics[0]?.finalAmount || 0;
    const allInvoices = stats.allTimeMetrics[0]?.allInvoices || 0;
    const paidInvoices = stats.allTimeMetrics[0]?.paidInvoices || 0;
    const overdueInvoices = stats.allTimeMetrics[0]?.overdueInvoices || 0;
    const dailyInvoices = stats.dailyInvoices[0]?.count || 0;

    const newInvoicesChange =
      prevMonthNewInvoices === 0
        ? currentMonthNewInvoices > 0
          ? 100
          : 0
        : ((currentMonthNewInvoices - prevMonthNewInvoices) / prevMonthNewInvoices) * 100;
    const totalAmountChange =
      prevMonthTotalAmount === 0
        ? allTimeTotalAmount > 0
          ? 100
          : 0
        : ((allTimeTotalAmount - prevMonthTotalAmount) / prevMonthTotalAmount) * 100;
    const finalAmountChange =
      prevMonthFinalAmount === 0
        ? allTimeFinalAmount > 0
          ? 100
          : 0
        : ((allTimeFinalAmount - prevMonthFinalAmount) / prevMonthFinalAmount) * 100;

    const weekdayMap = { "1": "Sun", "2": "Mon", "3": "Tue", "4": "Wed", "5": "Thu", "6": "Fri", "7": "Sat" };

    const fullWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const dayNumber = String(date.getDay() + 1);
      return { date: date.toISOString().split("T")[0], dayNumber, newInvoices: 0, totalAmount: 0, finalAmount: 0 };
    });

    stats.chartData.forEach((item: any) => {
      const index = fullWeek.findIndex((d) => d.date === item.date);
      if (index !== -1) {
        fullWeek[index].newInvoices = item.newInvoices || 0;
        fullWeek[index].totalAmount = item.totalAmount || 0;
        fullWeek[index].finalAmount = item.finalAmount || 0;
      }
    });

    const response = {
      newInvoices: {
        count: currentMonthNewInvoices,
        percentageChange: Number(newInvoicesChange.toFixed(2)),
        trend: newInvoicesChange > 0 ? "increased" : newInvoicesChange < 0 ? "decreased" : "unchanged",
      },
      totalAmount: {
        total: allTimeTotalAmount,
        percentageChange: Number(totalAmountChange.toFixed(2)),
        trend: totalAmountChange > 0 ? "increased" : totalAmountChange < 0 ? "decreased" : "unchanged",
      },
      finalAmount: {
        total: allTimeFinalAmount,
        percentageChange: Number(finalAmountChange.toFixed(2)),
        trend: finalAmountChange > 0 ? "increased" : finalAmountChange < 0 ? "decreased" : "unchanged",
      },
      allInvoices,
      paidInvoices,
      overdueInvoices,
      dailyInvoices,
      chartData: {
        newInvoices: fullWeek.map((item) => ({
          day: weekdayMap[item.dayNumber as keyof typeof weekdayMap],
          invoices: item.newInvoices,
          date: item.date,
        })),
        totalAmount: fullWeek.map((item) => ({
          day: weekdayMap[item.dayNumber as keyof typeof weekdayMap],
          total: item.totalAmount,
          date: item.date,
        })),
        finalAmount: fullWeek.map((item) => ({
          day: weekdayMap[item.dayNumber as keyof typeof weekdayMap],
          final: item.finalAmount,
          date: item.date,
        })),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    next(new CustomError(500, error instanceof Error ? error.message : "An unknown error occurred."));
  }
};