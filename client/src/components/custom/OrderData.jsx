import React, { useState } from "react";
import { Card } from "../ui/card";
import { ArrowDownToLine, IndianRupee } from "lucide-react";
import { PDFDocument, rgb } from "pdf-lib";
import axios from "axios";

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
  orderId,
  orderNumber = "ORD123456",
  invoiceNumber = "INV123456",
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleDownloadInvoice = async () => {
    try {
      console.log("Starting invoice generation...");

      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([600, 900]);
      const { height } = page.getSize();

      // Load logo image
      const logoUrl = "/logoswagfashion.png"; // Make sure this file is in your public folder

      let response;
      try {
        response = await fetch(logoUrl);
        if (!response.ok)
          throw new Error(`Failed to fetch logo. Status: ${response.status} ${response.statusText}`);
      } catch (fetchError) {
        console.error("Error fetching logo:", fetchError);
        alert(`Error fetching logo image: ${fetchError.message}`);
        return;
      }

      let logoImageBytes;
      try {
        logoImageBytes = await response.arrayBuffer();
      } catch (bufferError) {
        console.error("Error reading logo bytes:", bufferError);
        alert(`Error reading logo image data: ${bufferError.message}`);
        return;
      }

      let logoImage;
      try {
        logoImage = await pdfDoc.embedPng(logoImageBytes); // Use embedJpg if your image is JPG
      } catch (embedError) {
        console.error("Error embedding logo image:", embedError);
        alert(`Error embedding logo image: ${embedError.message}`);
        return;
      }

      const logoDims = logoImage.scale(0.3);

      // Draw logo on PDF
      page.drawImage(logoImage, {
        x: 20,
        y: height - 60,
        width: logoDims.width,
        height: logoDims.height,
      });

      // Draw invoice title near logo
      page.drawText("Tax Invoice/Bill of Supply/Cash Memo", {
        x: 300,
        y: height - 40,
        size: 10,
        color: rgb(0, 0, 0),
        maxWidth: 280,
      });

      // COMPANY DETAILS BLOCK
      const companyText = [
        `Sold By :`,
        companyInfo.name,
        ...companyInfo.addressLines,
        `PAN No: ${panNumber}`,
        `GST Registration No: ${gstNumber}`,
      ].join("\n");

      // Use delivery address for both billing and shipping
      const billingText = [
        `Billing Address :`,
        address || "N/A",
      ].join("\n");

      const shippingText = [
        `Shipping Address :`,
        address || "N/A",
      ].join("\n");

      const drawMultilineText = (page, text, x, y, size = 10) => {
        const lines = text.split("\n");
        lines.forEach((line, i) => {
          page.drawText(line, { x, y: y - i * 14, size, color: rgb(0, 0, 0) });
        });
        return lines.length * 14;
      };

      let y = height - 90;
      const companyHeight = drawMultilineText(page, companyText, 20, y, 8);
      const billingHeight = drawMultilineText(page, billingText, 320, y, 8);
      const shippingHeight = drawMultilineText(page, shippingText, 320, y - billingHeight - 20, 8);

      y -= Math.max(companyHeight, billingHeight + shippingHeight + 20) + 20;

      // ORDER INFO
      page.drawText(`Order Number: ${orderNumber}`, { x: 20, y, size: 9, color: rgb(0, 0, 0) });
      page.drawText(`Invoice Number: ${invoiceNumber}`, { x: 320, y, size: 9, color: rgb(0, 0, 0) });
      y -= 15;
      page.drawText(`Order Date: ${new Date(createdAt).toLocaleDateString()}`, {
        x: 20,
        y,
        size: 9,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Invoice Date: ${new Date(updatedAt).toLocaleDateString()}`, {
        x: 320,
        y,
        size: 9,
        color: rgb(0, 0, 0),
      });
      y -= 25;

      // TABLE HEADER
      page.drawRectangle({
        x: 20,
        y: y,
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
        page.drawText(col.label, { x: col.x, y: y + 5, size: 10, color: rgb(0, 0, 0) });
      });

      y -= 20;

      // TABLE ROWS
      products.forEach((product, index) => {
        if (y < 100) {
          page = pdfDoc.addPage([600, 900]);
          y = height - 40;
        }
        page.drawText((index + 1).toString(), { x: 25, y, size: 9, color: rgb(0, 0, 0) });
        page.drawText(product?.id?.name || "Unknown", { x: 60, y, size: 9, color: rgb(0, 0, 0) });
        page.drawText(`Rs.${(product?.id?.price ?? 0).toFixed(2)}`, { x: 310, y, size: 9, color: rgb(0, 0, 0) });
        page.drawText("0.00", { x: 395, y, size: 9, color: rgb(0, 0, 0) }); // Discount placeholder
        page.drawText(`${product?.quantity ?? 0}`, { x: 455, y, size: 9, color: rgb(0, 0, 0) });
        const netAmt = (product?.quantity ?? 0) * (product?.id?.price ?? 0);
        page.drawText(`Rs.${netAmt.toFixed(2)}`, { x: 485, y, size: 9, color: rgb(0, 0, 0) });

        y -= 15;
      });

      // TOTAL AMOUNT
      page.drawText(`TOTAL: Rs.${amount.toFixed(2)}`, { x: 20, y: y - 10, size: 11, color: rgb(0, 0, 0) });

      y -= 40;

      // FOOTER
      page.drawText("Thank you for your order!", { x: 230, y: 30, size: 12, color: rgb(0, 0, 0) });

      // SAVE & DOWNLOAD
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

  const handleCancelOrder = async () => {
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
                <h1 className="font-semibold text-sm sm:text-lg">{product?.id?.name || "Unknown Product"}</h1>
                <p className="flex text-xs sm:text-md gap-2 text-gray-500 my-2 sm:my-0">
                  <span>
                    Color:{" "}
                    <span
                      className="inline-block w-4 h-2 rounded-full border border-gray-300"
                      style={{ backgroundColor: product?.color || "transparent" }}
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
                <IndianRupee size={18} /> {(product?.id?.price ?? 0).toFixed(2)}
              </h2>
              <p className="dark:text-customYellow text-end">Qty: {product?.quantity ?? 0}</p>
            </div>
          </div>
        ))}

        {/* Removed Billing & Shipping addresses from UI */}

        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <span>
            Ordered On:{" "}
            <span className="capitalize">{new Date(createdAt).toLocaleString()}</span>
          </span>
          <span
            onClick={handleDownloadInvoice}
            className="hover:underline text-sm cursor-pointer flex items-center gap-1 dark:text-customYellow"
          >
            <ArrowDownToLine size={10} />
            Download Invoice
          </span>
        </div>

        <hr />

        <div className="flex justify-between items-center">
          <span>
            Delivery At: <span className="capitalize">{address || "N/A"}</span>
          </span>
          {status !== "Exchange" && (
            <button
              onClick={handleCancelOrder}
              className="bg-indigo-700 hover:bg-blue-600 text-white text-xs sm:text-sm px-3 py-1 rounded-lg"
            >
              Exchange
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OrderData;
