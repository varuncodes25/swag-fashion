import React, { useState } from "react";
import { Card } from "../ui/card";
import { ArrowDownToLine, IndianRupee } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import axios from "axios";
import { CancelOrderDialog } from "../CancelOrderDialog";

const OrderData = ({
  products = [],
  companyInfo = {
    name: "Swag Fashion",
    addressLines: [
      "Parshv Elite Building No.1, Birwadi Road",
      "Umroli East, Palghar, Maharashtra - 401404",
    ],
  },
  gstNumber = "29ABCDE1234F2Z5",
  panNumber = "ABCDE1234F",
  amount = 0,
  address = "",
  status = "pending",
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
  _id,
  orderNumber = "ORD123456",
  invoiceNumber = "INV123456",
  isCancelled,
  isPaid = true,
}) => {
  const [trackingData, setTrackingData] = useState([]);

  // Cancel Order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/cancel-order/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Order cancelled successfully");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to cancel order");
    }
  };

  // Track Order
  const handleTrackOrder = async (orderId) => {
    console.log("Tracking order:", orderId);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders/track/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTrackingData(res.data.tracking || []);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch tracking data");
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([600, 900]);
      let { width, height } = page.getSize();

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Helper function to draw multiline text
      const drawMultilineText = (page, text, x, y, size = 10) => {
        const lines = text.split("\n");
        lines.forEach((line, i) => {
          page.drawText(line, {
            x,
            y: y - i * 14,
            size,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        });
        return lines.length * 14;
      };

      // Function to add new page and reset y
      const addNewPage = () => {
        page = pdfDoc.addPage([600, 900]);
        const { height: newHeight } = page.getSize();
        height = newHeight;
        return height - 40; // reset y
      };

      // Draw header
      const drawHeader = () => {
        page.drawRectangle({
          x: 0,
          y: height - 60,
          width: width,
          height: 40,
          color: rgb(0.9, 0.9, 0.9),
        });

        const title = "Tax Invoice/Bill of Supply/Cash Memo";
        const textWidthTitle = helveticaFont.widthOfTextAtSize(title, 14);
        page.drawText(title, {
          x: width - textWidthTitle - 20,
          y: height - 45,
          size: 14,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });

        page.drawText("SWAG FASHION", {
          x: 20,
          y: height - 45,
          size: 14,
          font: helveticaFont,
          color: rgb(0.6, 0, 0.6),
        });
      };

      drawHeader();

      let y = height - 90;

      // Company, billing, shipping
      const companyText = [
        `Sold By :`,
        companyInfo.name,
        ...companyInfo.addressLines,
        `PAN No: ${panNumber}`,
        `GST Registration No: ${gstNumber}`,
      ].join("\n");

      const billingText = [`Billing Address :`, address || "N/A"].join("\n");
      const shippingText = [`Shipping Address :`, address || "N/A"].join("\n");

      const companyHeight = drawMultilineText(page, companyText, 20, y, 8);
      const billingHeight = drawMultilineText(page, billingText, 320, y, 8);
      const shippingHeight = drawMultilineText(
        page,
        shippingText,
        320,
        y - billingHeight - 20,
        8
      );

      y -= Math.max(companyHeight, billingHeight + shippingHeight + 20) + 20;

      // Order info
      const orderInfo = [
        [`Order Number: ${orderNumber}`, `Invoice Number: ${invoiceNumber}`],
        [
          `Order Date: ${new Date(createdAt).toLocaleDateString()}`,
          `Invoice Date: ${new Date(updatedAt).toLocaleDateString()}`,
        ],
      ];

      orderInfo.forEach((row) => {
        page.drawText(row[0], {
          x: 20,
          y,
          size: 9,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        page.drawText(row[1], {
          x: 320,
          y,
          size: 9,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        y -= 15;
      });

      y -= 10;

      // Table header
      const drawTableHeader = () => {
        page.drawRectangle({
          x: 20,
          y,
          width: 560,
          height: 20,
          color: rgb(0.9, 0.9, 0.9),
        });
        const columns = [
          { label: "Sl. No.", x: 25 },
          { label: "Description", x: 60 },
          { label: "Unit Price", x: 310 },
          { label: "Discount", x: 390 },
          { label: "Qty", x: 450 },
          { label: "Net Amount", x: 485 },
        ];
        columns.forEach((col) => {
          page.drawText(col.label, {
            x: col.x,
            y: y + 5,
            size: 10,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        });
        y -= 20;
      };

      drawTableHeader();

      // Table rows
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (y < 100) {
          y = addNewPage();
          drawHeader();
          drawTableHeader();
        }
        const netAmt = (product?.quantity ?? 0) * (product?.id?.price ?? 0);
        const rowData = [
          (i + 1).toString(),
          product?.id?.name || "Unknown",
          `Rs.${(product?.id?.price ?? 0).toFixed(2)}`,
          "0.00",
          `${product?.quantity ?? 0}`,
          `Rs.${netAmt.toFixed(2)}`,
        ];
        const xPositions = [25, 60, 310, 395, 455, 485];
        rowData.forEach((text, idx) => {
          page.drawText(text, {
            x: xPositions[idx],
            y,
            size: 9,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        });
        y -= 15;
      }

      // Total amount
      page.drawText(`TOTAL: Rs.${amount.toFixed(2)}`, {
        x: 20,
        y: y - 10,
        size: 11,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      // Footer
      page.drawText("Thank you for your order!", {
        x: 230,
        y: 30,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      // Save & download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "invoice.pdf";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }, 100);

      console.log("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF invoice:", error);
      alert(`Error generating invoice: ${error?.message || error}`);
    }
  };

  return (
    <div>
      <Card className="grid gap-2 p-2">
        {products.map((product) => (
          <div
            key={product._id}
            className="flex flex-col sm:flex-row justify-between items-end sm:items-center border p-3 rounded-lg bg-gray-100 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-2">
              <img
                src={product?.id?.images?.[0]?.url || ""}
                alt={product?.id?.name || "Product"}
                className="w-20 h-20 rounded-lg"
              />
              <div className="grid gap-1">
                <h1 className="font-semibold text-sm sm:text-lg">
                  {product?.id?.name || "Unknown Product"}
                </h1>
                <p className="flex text-xs sm:text-md gap-2 text-gray-500 my-2 sm:my-0">
                  <span>
                    Color:{" "}
                    <span
                      className="inline-block w-4 h-2 rounded-full border border-gray-300"
                      style={{
                        backgroundColor: product?.color || "transparent",
                      }}
                    />
                  </span>
                  <span className="hidden sm:block">|</span>
                  <span>
                    Status: <span className="capitalize">{status}</span>
                  </span>
                </p>
              </div>
            </div>
            <div className="flex sm:flex-col gap-3 sm:gap-0 mt-2 sm:mt-0 sm:items-center">
              <h2 className="text-md sm:text-xl font-bold flex items-center dark:text-customYellow">
                <IndianRupee size={18} /> {(amount ?? 0).toFixed(2)}
              </h2>
              <p className="dark:text-customYellow text-end">
                Qty: {product?.quantity ?? 0}
              </p>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-2">
          <span>
            Ordered On:{" "}
            <span className="capitalize">
              {new Date(createdAt).toLocaleString()}
            </span>
          </span>
          <span
            onClick={handleDownloadInvoice}
            className="hover:underline text-sm cursor-pointer flex items-center gap-1 dark:text-customYellow"
          >
            <ArrowDownToLine size={10} />
            Download Invoice
          </span>
        </div>

        <hr className="my-2" />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <span>
            Delivery At:{" "}
            {address ? (
              <>
                {address.name}, {address.street}, {address.city},{" "}
                {address.state} - {address.zip}, {address.country} <br />
                Phone: {address.phone}, Email: {address.email}
              </>
            ) : (
              "N/A"
            )}
          </span>

          <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0 items-start sm:items-center">
            {status !== "Exchange" && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Cancel Button */}
                <CancelOrderDialog
                  orderId={_id}
                  isCancelled={isCancelled}
                  onSuccess={(updatedOrder) => {
                    console.log("Order cancelled:", updatedOrder);
                    // e.g., refresh orders list or update state
                  }}
                />

                {/* Exchange Button */}
                <button
                  className={`w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ${
                    !isPaid
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105"
                  }`}
                  disabled={!isPaid}
                >
                  Exchange
                </button>
              </div>
            )}

            {/* Track Order Button */}
            <button
              onClick={() => handleTrackOrder(_id)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:scale-105"
            >
              Track Order
            </button>
          </div>
        </div>

        {/* Show tracking status */}
        {trackingData.length > 0 && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-zinc-700 rounded">
            <h2 className="font-semibold">Tracking Status:</h2>
            <ul className="list-disc ml-5">
              {trackingData.map((step, idx) => (
                <li key={idx}>
                  <strong>{step.status}</strong> at{" "}
                  {new Date(step.updated_at).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrderData;
