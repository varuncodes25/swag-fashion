const { ROLES } = require("../utils/constants");
const {
  previewExchange,
  createExchangeRequest,
  getExchangeById,
  getUserExchanges,
  getAllExchangesAdmin,
  cancelExchange,
  approveExchange,
  rejectExchange,
  completeExchange,
  markExchangePaymentPaid,
  updateExchangeStatus,
  ExchangeError,
} = require("../service/exchangeService");

const handleExchangeError = (res, error, fallback = "Exchange operation failed") => {
  if (error instanceof ExchangeError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Exchange error:", error);
  return res.status(500).json({
    success: false,
    message: fallback,
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};

const previewExchangeRequest = async (req, res) => {
  try {
    const data = await previewExchange(req.id, req.role, req.body);
    return res.json({ success: true, data });
  } catch (error) {
    return handleExchangeError(res, error, "Failed to preview exchange");
  }
};

const createExchange = async (req, res) => {
  try {
    const result = await createExchangeRequest(req.id, req.role, req.body);
    return res.status(201).json({
      success: true,
      message: result.message,
      data: {
        exchange: result.exchange,
        orderId: result.exchange.orderId,
        orderNumber: result.exchange.orderNumber,
        status: "EXCHANGE_REQUESTED",
      },
    });
  } catch (error) {
    return handleExchangeError(res, error, "Failed to submit exchange request");
  }
};

const getMyExchanges = async (req, res) => {
  try {
    const data = await getUserExchanges(req.id, req.query);
    return res.json({ success: true, data });
  } catch (error) {
    return handleExchangeError(res, error, "Failed to fetch exchanges");
  }
};

const getExchangeDetails = async (req, res) => {
  try {
    const exchange = await getExchangeById(req.params.id, req.id, req.role);
    return res.json({ success: true, data: exchange });
  } catch (error) {
    return handleExchangeError(res, error, "Failed to fetch exchange details");
  }
};

const cancelExchangeRequest = async (req, res) => {
  try {
    const exchange = await cancelExchange(
      req.params.id,
      req.id,
      req.role,
      req.body?.reason,
    );
    return res.json({
      success: true,
      message: "Exchange request cancelled",
      data: exchange,
    });
  } catch (error) {
    return handleExchangeError(res, error, "Failed to cancel exchange");
  }
};

const getAdminExchanges = async (req, res) => {
  try {
    if (req.role !== ROLES.admin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const data = await getAllExchangesAdmin(req.query);
    return res.json({ success: true, data });
  } catch (error) {
    return handleExchangeError(res, error, "Failed to fetch admin exchanges");
  }
};

const approveExchangeRequest = async (req, res) => {
  try {
    if (req.role !== ROLES.admin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const exchange = await approveExchange(
      req.params.id,
      req.id,
      req.body?.adminNotes,
    );
    return res.json({
      success: true,
      message: "Exchange approved",
      data: exchange,
    });
  } catch (error) {
    return handleExchangeError(res, error, "Failed to approve exchange");
  }
};

const rejectExchangeRequest = async (req, res) => {
  try {
    if (req.role !== ROLES.admin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const exchange = await rejectExchange(
      req.params.id,
      req.id,
      req.body?.rejectionReason,
    );
    return res.json({
      success: true,
      message: "Exchange rejected",
      data: exchange,
    });
  } catch (error) {
    return handleExchangeError(res, error, "Failed to reject exchange");
  }
};

const completeExchangeRequest = async (req, res) => {
  try {
    if (req.role !== ROLES.admin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const exchange = await completeExchange(
      req.params.id,
      req.id,
      req.body?.adminNotes,
    );
    return res.json({
      success: true,
      message: "Exchange completed successfully",
      data: exchange,
    });
  } catch (error) {
    return handleExchangeError(res, error, "Failed to complete exchange");
  }
};

const markExchangePaid = async (req, res) => {
  try {
    if (req.role !== ROLES.admin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const exchange = await markExchangePaymentPaid(req.params.id, req.id, req.body);
    return res.json({
      success: true,
      message: "Exchange payment marked as paid",
      data: exchange,
    });
  } catch (error) {
    return handleExchangeError(res, error, "Failed to update payment status");
  }
};

const updateExchangeProgress = async (req, res) => {
  try {
    if (req.role !== ROLES.admin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const exchange = await updateExchangeStatus(
      req.params.id,
      req.id,
      req.body?.status,
      req.body?.note,
    );
    return res.json({
      success: true,
      message: "Exchange status updated",
      data: exchange,
    });
  } catch (error) {
    return handleExchangeError(res, error, "Failed to update exchange status");
  }
};

module.exports = {
  previewExchangeRequest,
  createExchange,
  getMyExchanges,
  getExchangeDetails,
  cancelExchangeRequest,
  getAdminExchanges,
  approveExchangeRequest,
  rejectExchangeRequest,
  completeExchangeRequest,
  markExchangePaid,
  updateExchangeProgress,
};
