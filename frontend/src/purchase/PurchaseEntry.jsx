import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Calendar,
  Truck,
  CreditCard,
  Package,
} from "lucide-react";
import { ApiService } from "../mastermodel/services/ApiService";
import SearchableSelect from "./SearchableSelect";
import AsyncSupplierSelect from "./AsyncSupplierSelect";
import toast from "react-hot-toast";
import "../mastermodel/styles/MasterModel.css";

const newRow = () => ({
  id: Date.now() + Math.random(),
  productId: "",
  productName: "",
  currentStock: 0,
  hsnCode: "",
  batchNo: "",
  prevBatchNo: "",
  purchaseQty: 1,
  freeQty: 1,
  unitValue: 1,
  quantity: 1, // This will be the total increment
  unit: "Bag",
  purchasePrice: "",
  salePrice: "",
  discountType: "%", // 'Amt' or '%'
  discountValue: 0,
  taxPercent: "",
  taxAmount: 0,
  totalAmount: 0,
  purchaseDate: new Date().toISOString().split("T")[0],
  expiryDate: "",
  availableUnits: [],
  multiUnits: [],
  primaryUnit: "Bag",
  baseUnitValue: 1,
});

const PurchaseEntry = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const rowRefs = useRef({});
  const qtyRefs = useRef({});

  const [master, setMaster] = useState({
    supplierId: "",
    supplierInvoiceNumber: "",
    billDate: new Date().toISOString().split("T")[0],
    totalQuantity: 0,
    subtotal: 0,
    totalTaxAmount: 0,
    discount: 0,
    discountType: "%",
    grandTotal: 0,
    cashAmount: 0,
    upiAmount: 0,
    swipeAmount: 0,
    creditAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
    remark: "",
  });

  const [children, setChildren] = useState([newRow()]);
  const rowToFocus = useRef(null);

  useEffect(() => {
    if (rowToFocus.current) {
      setTimeout(() => {
        const el = rowRefs.current[rowToFocus.current];
        if (el) {
          el.focus();
          rowToFocus.current = null;
        }
      }, 100);
    }
  }, [children]);

  const [units, setUnits] = useState([]);

  useEffect(() => {
    ApiService.getAll("suppliers")
      .then((data) => {
        console.log("Fetched Suppliers:", data);
        if (Array.isArray(data)) setSuppliers(data);
      })
      .catch((err) => console.error("Supplier fetch error:", err));

    ApiService.getAll("products")
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error("Product fetch error:", err));

    if (id) {
      ApiService.getById("purchases", id)
        .then((data) => {
          if (data) {
            setMaster({
              supplierId: data.supplierId || "",
              supplierInvoiceNumber: data.supplierInvoiceNumber || "",
              billDate: data.billDate || new Date().toISOString().split("T")[0],
              totalQuantity: data.totalQuantity || 0,
              subtotal: data.subtotal || 0,
              totalTaxAmount: data.totalTaxAmount || 0,
              discount: data.discount || 0,
              discountType: data.discountType || "%",
              grandTotal: data.grandTotal || 0,
              cashAmount: data.cashAmount || 0,
              upiAmount: data.upiAmount || 0,
              swipeAmount: data.swipeAmount || 0,
              paidAmount: data.paidAmount || 0,
              dueAmount: data.dueAmount || 0,
              remark: data.remark || "",
            });

            if (data.items && data.items.length > 0) {
              setChildren(
                data.items.map((item) => ({
                  ...newRow(),
                  ...item,
                  id: item.id || Date.now() + Math.random(),
                  productId: item.productId,
                  purchaseQty: item.purchaseQty,
                  freeQty: item.freeQty,
                  quantity: item.quantity,
                  unit: item.unit,
                  batchNo: item.batchNo,
                  expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
                  purchasePrice: item.purchasePrice,
                  salePrice: item.salePrice,
                  taxPercent: item.taxPercent,
                  taxAmount: item.taxAmount,
                  totalAmount: item.totalAmount,
                })),
              );
            }
          }
        })
        .catch((err) => console.error("Fetch purchase error:", err));
    }

    ApiService.getAll("units")
      .then((data) => {
        if (Array.isArray(data)) setUnits(data);
      })
      .catch((err) => console.error("Unit fetch error:", err));
  }, []);

  const calculateTotals = (rows, discount, paymentFields = {}) => {
    let totalQty = 0,
      subtotal = 0,
      totalTax = 0;
    rows.forEach((child) => {
      const qtyFin = parseFloat(child.purchaseQty) || 0;
      const price = parseFloat(child.purchasePrice) || 0;
      const taxP = parseFloat(child.taxPercent) || 0;
      const discVal = parseFloat(child.discountValue) || 0;

      let rowSub = qtyFin * price;
      let discountAmount =
        child.discountType === "%" ? (rowSub * discVal) / 100 : discVal;
      let taxableAmount = Math.max(0, rowSub - discountAmount);
      let rowTax = (taxableAmount * taxP) / 100;

      totalQty += qtyFin;
      subtotal += taxableAmount;
      totalTax += rowTax;
    });

    const discVal = parseFloat(discount) || 0;
    const discType = paymentFields.discountType || master.discountType;
    const globalDiscAmount = discType === "%" ? ((subtotal + totalTax) * discVal / 100) : discVal;

    // Calculate raw total including tax
    const rawGrandTotal = subtotal + totalTax - globalDiscAmount;
    // Final grand total is rounded to the nearest integer
    const grandTotal = Math.round(rawGrandTotal);
    // Difference for display
    const roundOff = (grandTotal - rawGrandTotal).toFixed(2);

    // Use passed values or current master values
    const cash =
      parseFloat(
        paymentFields.cashAmount !== undefined
          ? paymentFields.cashAmount
          : master.cashAmount,
      ) || 0;
    const upi =
      parseFloat(
        paymentFields.upiAmount !== undefined
          ? paymentFields.upiAmount
          : master.upiAmount,
      ) || 0;
    const swipe =
      parseFloat(
        paymentFields.swipeAmount !== undefined
          ? paymentFields.swipeAmount
          : master.swipeAmount,
      ) || 0;

    const totalPaid = cash + upi + swipe;
    const due = grandTotal - totalPaid;

    setMaster((prev) => ({
      ...prev,
      totalQuantity: totalQty,
      subtotal,
      totalTaxAmount: totalTax,
      grandTotal,
      roundOff,
      paidAmount: totalPaid,
      dueAmount: due,
      creditAmount: due > 0 ? due : 0,
      discount: discVal,
      discountType: discType,
      ...paymentFields,
    }));
  };

  const handleChildChange = (id, field, value, extraData) => {
    if (field === "productId" && value) {
      const isDuplicate = children.some(
        (child) => String(child.productId) === String(value) && child.id !== id,
      );
      if (isDuplicate) {
        toast.error("This product is already added in the list!");
        return false;
      }
      toast.success(`${extraData?.name || "Product"} added`);
    }

    const getStockIncrement = (unitStr, qty, uVal) => {
      const u = (unitStr || "").trim().toLowerCase();
      const q = parseFloat(qty) || 0;
      const uv = parseFloat(uVal) || 1;
      if (u === "kg" || u === "kilogram" || u === "kgs") return q;
      if (u.includes("quintal") || u === "qtl" || u === "qntl") return q; // Treat input as KG, conversion happens in display
      if (u === "bag" || u === "bags") return q * uv;
      return q * uv;
    };

    const updated = children.map((child) => {
      if (child.id !== id) return child;
      let u = { ...child, [field]: value };
      if (field === "productId") {
        if (value && extraData) {
          u.productName = extraData.name || "";
          u.currentStock = extraData.currentStock || 0;
          u.hsnCode = extraData.hsnCode || "";
          u.purchasePrice = parseFloat(extraData.purchasePrice) || "";
          u.taxPercent = parseFloat(extraData.tax) || "";
          u.unit = extraData.unit || "Bag";
          u.unitValue = parseFloat(extraData.unitValue) || 1;
          u.baseUnitValue = parseFloat(extraData.unitValue) || 1;
          u.primaryUnit = extraData.unit || "Bag";
          u.multiUnits = extraData.multiUnits || [];
          u.purchaseQty = 1;
          u.freeQty = 1;
          u.quantity = getStockIncrement(
            u.unit,
            u.purchaseQty + u.freeQty,
            u.unitValue,
          );

          const prodUnits = [extraData.unit];
          if (extraData.multiUnits && Array.isArray(extraData.multiUnits)) {
            extraData.multiUnits.forEach((mu) => {
              if (mu.alternative && !prodUnits.includes(mu.alternative)) {
                prodUnits.push(mu.alternative);
              }
            });
          }
          u.availableUnits = prodUnits.filter(Boolean);

          // Fetch latest batch info
          ApiService.getById("products", `${value}/latest-batch`)
            .then((res) => {
              if (res) {
                setChildren((prevRows) =>
                  prevRows.map((row) => {
                    if (row.id === id) {
                      return {
                        ...row,
                        prevBatchNo: res.batchNo || "",
                      };
                    }
                    return row;
                  })
                );
              }
            })
            .catch((err) => console.log("Batch fetch error:", err));
        } else {
          // Clear info if product is discarded
          u.productName = "";
          u.currentStock = 0;
          u.hsnCode = "";
          u.purchasePrice = "";
          u.salePrice = "";
          u.taxPercent = "";
          u.unit = "Bag";
          u.unitValue = 1;
          u.baseUnitValue = 1;
          u.primaryUnit = "Bag";
          u.multiUnits = [];
          u.purchaseQty = 1;
          u.freeQty = 0;
          u.quantity = 1;
          u.availableUnits = [];
        }
      }

      if (field === "purchaseQty" || field === "freeQty" || field === "unit") {
        let currentUnitValue = u.unitValue;
        if (field === "unit") {
          const selectedUnit = value;
          if (selectedUnit === u.primaryUnit) {
            currentUnitValue = u.baseUnitValue;
          } else {
            const mu = u.multiUnits.find((m) => m.alternative === selectedUnit);
            if (mu) currentUnitValue = parseFloat(mu.conversion) || 1;
          }
          u.unitValue = currentUnitValue;
        }

        const totalQtyForIncrement =
          (parseFloat(field === "purchaseQty" ? value : u.purchaseQty) || 0) +
          (parseFloat(field === "freeQty" ? value : u.freeQty) || 0);

        u.quantity = getStockIncrement(
          field === "unit" ? value : u.unit,
          totalQtyForIncrement,
          currentUnitValue,
        );
      }

      const qtyForTotal =
        parseFloat(field === "purchaseQty" ? value : u.purchaseQty) || 0;
      const price =
        parseFloat(field === "purchasePrice" ? value : u.purchasePrice) || 0;
      const taxP =
        parseFloat(field === "taxPercent" ? value : u.taxPercent) || 0;
      const discVal =
        parseFloat(field === "discountValue" ? value : u.discountValue) || 0;
      const discType = field === "discountType" ? value : u.discountType;

      let rowSub = qtyForTotal * price;
      let discountAmount =
        discType === "%" ? (rowSub * discVal) / 100 : discVal;
      let taxableAmount = Math.max(0, rowSub - discountAmount);
      let rowTax = (taxableAmount * taxP) / 100;

      u.taxAmount = rowTax;
      // Row total now excludes discount as per user request
      u.totalAmount = rowSub;
      return u;
    });
    setChildren(updated);
    calculateTotals(updated, master.discount);

    if (field === "productId" && value) {
      setTimeout(() => {
        if (qtyRefs.current[id]) qtyRefs.current[id].focus();
      }, 50);
    }
    return true;
  };

  const addChildRow = () => {
    const r = newRow();
    rowToFocus.current = r.id;
    setChildren((prev) => [...prev, r]);
  };

  const removeChildRow = (id) => {
    if (children.length > 1) {
      const updated = children.filter((c) => c.id !== id);
      setChildren(updated);
      calculateTotals(updated, master.discount);
    } else {
      setChildren([newRow()]);
      calculateTotals([newRow()], master.discount);
    }
  };

  const handleProductEnterSelect = () => addChildRow();

  const handleEnterNavigation = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === children.length - 1) {
        addChildRow();
      } else {
        const nextId = children[index + 1].id;
        const el = rowRefs.current[nextId];
        if (el) el.focus();
      }
    }
  };

  const [supplierDue, setSupplierDue] = useState(0);

  const handleMasterChange = (field, value) => {
    if (field === "supplierId") {
      setMaster((prev) => ({ ...prev, [field]: value }));
      if (value) {
        ApiService.getById("suppliers", value)
          .then((data) => {
            if (data && data.totalDue !== undefined) {
              setSupplierDue(data.totalDue);
            }
          })
          .catch((err) => console.error("Supplier fetch due error:", err));
      } else {
        setSupplierDue(0);
      }
    } else if (
      ["discount", "discountType", "cashAmount", "upiAmount", "swipeAmount"].includes(field)
    ) {
      const newFields = { [field]: value };
      calculateTotals(
        children,
        field === "discount" ? value : master.discount,
        newFields,
      );
    } else {
      setMaster((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!master.supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    const validRows = children.filter(
      (c) => c.productId && parseFloat(c.quantity) > 0,
    );
    if (validRows.length === 0) {
      toast.error("Please add at least one valid product");
      return;
    }

    try {
      // Map master data with type casting
      const masterData = {
        supplierId: Number(master.supplierId),
        billDate: master.billDate,
        supplierInvoiceNumber: master.supplierInvoiceNumber || "",
        totalQuantity: parseFloat(master.totalQuantity) || 0,
        subtotal: parseFloat(master.subtotal) || 0,
        totalTaxAmount: parseFloat(master.totalTaxAmount) || 0,
        discount: parseFloat(master.discount) || 0,
        grandTotal: parseFloat(master.grandTotal) || 0,
        cashAmount: parseFloat(master.cashAmount) || 0,
        upiAmount: parseFloat(master.upiAmount) || 0,
        swipeAmount: parseFloat(master.swipeAmount) || 0,
        paidAmount: parseFloat(master.paidAmount) || 0,
        dueAmount: parseFloat(master.dueAmount) || 0,
        remark: master.remark || "",
      };

      // Map item data with type casting
      const itemsData = validRows.map((row) => ({
        productId: Number(row.productId),
        quantity: parseFloat(row.quantity) || 0, // Stock increment (Qty + Free)
        purchaseQty: parseFloat(row.purchaseQty) || 0,
        freeQty: parseFloat(row.freeQty) || 0,
        unit: row.unit,
        batchNo: row.batchNo || "",
        expiryDate: row.expiryDate || null,
        purchasePrice: parseFloat(row.purchasePrice) || 0,
        salePrice: parseFloat(row.salePrice) || 0,
        taxPercent: parseFloat(row.taxPercent) || 0,
        taxAmount: parseFloat(row.taxAmount) || 0,
        discountValue: parseFloat(row.discountValue) || 0,
        totalAmount: parseFloat(row.totalAmount) || 0,
      }));

      const payload = {
        id: id ? Number(id) : undefined,
        ...masterData,
        items: itemsData,
      };

      console.log("Saving Purchase Payload:", payload);
      await ApiService.save("purchases", payload);
      toast.success("Purchase Bill saved successfully!");
      navigate("/purchase/bills");
    } catch (error) {
      console.error("Save Error:", error);
      const msg =
        error.response?.data?.message ||
        "Failed to save bill. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="agro-container">
      <div>
        <div
          className="agro-header-compact"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            margin: "-5px -5px 20px -5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 10px",
            borderBottom: "1px solid var(--border-light)",
            background: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", marginBottom: "1px" }}>
              New Purchase Entry
            </h2>
            <p style={{ fontSize: "12px", margin: 0 }}>
              Add a new stock purchase bill
            </p>
          </div>
          <button
            className="btn-agro btn-outline"
            onClick={() => navigate("/purchase/bills")}
            style={{ height: "34px", padding: "0 12px", fontSize: "12px" }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: "15px 10px" }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {/* Supplier Details Section */}
            <div
              style={{
                padding: "12px",
                background: "#ffffff",
                borderRadius: "12px",
                border: "1px solid var(--border-light)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "10px",
                  color: "var(--primary)",
                }}
              >
                <Truck size={16} />
                <h3 style={{ fontSize: "13px", margin: 0, fontWeight: "700" }}>
                  Supplier Details
                </h3>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 1fr",
                  gap: "15px",
                }}
              >
                <div className="form-group" style={{ margin: 0 }}>
                  <label
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      textTransform: "uppercase",
                      fontWeight: "700",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Supplier
                  </label>
                  <AsyncSupplierSelect
                    value={master.supplierId}
                    onChange={(val) => handleMasterChange("supplierId", val)}
                    placeholder="Search Supplier..."
                    height="36px"
                  />
                  {supplierDue > 0 && (
                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>
                      Previous Pending: ₹{supplierDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      textTransform: "uppercase",
                      fontWeight: "700",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Supplier Inv No.
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ height: "36px", fontSize: "13px" }}
                    value={master.supplierInvoiceNumber}
                    onChange={(e) =>
                      handleMasterChange(
                        "supplierInvoiceNumber",
                        e.target.value,
                      )
                    }
                    placeholder="Enter Invoice No."
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      textTransform: "uppercase",
                      fontWeight: "700",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Bill Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ height: "36px", fontSize: "13px" }}
                    value={master.billDate}
                    onChange={(e) =>
                      handleMasterChange("billDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Product Table Section */}
            <div
              style={{
                border: "1px solid var(--border-light)",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  padding: "10px 15px",
                  background: "#ffffff",
                  borderBottom: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--primary)",
                  }}
                >
                  <Package size={16} />
                  <h3
                    style={{ fontSize: "13px", margin: 0, fontWeight: "700" }}
                  >
                    Products
                  </h3>
                </div>
                <button
                  className="btn-agro btn-primary"
                  onClick={addChildRow}
                  style={{
                    height: "28px",
                    padding: "0 10px",
                    fontSize: "11px",
                    background: "var(--primary)",
                  }}
                >
                  <Plus size={14} /> Add Row
                </button>
              </div>
              <div
                className="agro-table-wrapper-simple"
                style={{ overflowX: "auto" }}
              >
                <table className="agro-table" style={{ border: "none" }}>
                  <thead style={{ background: "#ffffff" }}>
                    <tr>
                      <th
                        style={{
                          minWidth: "300px",
                          fontSize: "10px",
                          letterSpacing: "0.05em",
                          textAlign: "left",
                        }}
                      >
                        PRODUCT NAME
                      </th>
                      <th
                        style={{
                          minWidth: "80px",
                          fontSize: "10px",
                          textAlign: "center",
                          letterSpacing: "0.05em",
                        }}
                      >
                        BATCH NO
                      </th>
                      <th
                        style={{
                          minWidth: "110px",
                          fontSize: "10px",
                          textAlign: "center",
                          letterSpacing: "0.05em",
                        }}
                      >
                        EXPIRY DATE
                      </th>
                      <th
                        style={{
                          minWidth: "60px",
                          fontSize: "10px",
                          textAlign: "center",
                          letterSpacing: "0.05em",
                        }}
                      >
                        QTY
                      </th>
                      <th
                        style={{
                          minWidth: "60px",
                          fontSize: "10px",
                          textAlign: "center",
                          letterSpacing: "0.05em",
                        }}
                      >
                        FREE QTY
                      </th>
                      <th
                        style={{
                          minWidth: "90px",
                          fontSize: "10px",
                          textAlign: "center",
                          letterSpacing: "0.05em",
                        }}
                      >
                        UNIT
                      </th>
                      <th
                        style={{
                          minWidth: "90px",
                          fontSize: "10px",
                          textAlign: "center",
                          letterSpacing: "0.05em",
                        }}
                      >
                        STOCK INCR.
                      </th>
                      <th
                        style={{
                          minWidth: "100px",
                          fontSize: "10px",
                          textAlign: "center",
                          letterSpacing: "0.05em",
                        }}
                      >
                        PURCHASE RATE
                      </th>
                      <th
                        style={{
                          minWidth: "100px",
                          fontSize: "10px",
                          textAlign: "center",
                          letterSpacing: "0.05em",
                        }}
                      >
                        SALE RATE
                      </th>
                      <th
                        style={{
                          minWidth: "130px",
                          fontSize: "10px",
                          textAlign: "center",
                          letterSpacing: "0.05em",
                        }}
                      >
                        DISCOUNT
                      </th>
                      <th
                        style={{
                          minWidth: "70px",
                          fontSize: "10px",
                          textAlign: "center",
                          letterSpacing: "0.05em",
                        }}
                      >
                        TAX %
                      </th>
                      <th
                        style={{
                          minWidth: "100px",
                          fontSize: "10px",
                          textAlign: "right",
                          paddingRight: "15px",
                          letterSpacing: "0.05em",
                        }}
                      >
                        TOTAL
                      </th>
                      <th style={{ minWidth: "40px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {children.map((child, idx) => (
                      <tr key={child.id}>
                        <td
                          style={{
                            minWidth: "300px",
                            paddingLeft: "10px",
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div style={{ flex: 1, minWidth: "180px" }}>
                              <SearchableSelect
                                inputRef={(el) =>
                                  (rowRefs.current[child.id] = el)
                                }
                                options={products}
                                value={child.productId}
                                onChange={(val, extra) =>
                                  handleChildChange(
                                    child.id,
                                    "productId",
                                    val,
                                    extra,
                                  )
                                }
                                placeholder="Search Product..."
                                height="34px"
                                searchKey="name"
                              />
                            </div>
                            {child.productId && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "6px",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  color: "#64748b",
                                  whiteSpace: "nowrap",
                                  background: "#f1f5f9",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                }}
                              >
                                <span>
                                  STK:{" "}
                                  <span
                                    style={{
                                      color:
                                        child.currentStock <= 0
                                          ? "#ef4444"
                                          : "#166534",
                                    }}
                                  >
                                    {child.currentStock}
                                  </span>
                                </span>
                                <span style={{ color: "#cbd5e1" }}>|</span>
                                <span>HSN: {child.hsnCode || "N/A"}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ minWidth: "80px", padding: "0 4px" }}>
                          {child.productId && (
                            <div style={{ fontSize: '9px', fontWeight: '800', color: '#0284c7', textAlign: 'center', marginBottom: '2px' }}>
                              Prev: {child.prevBatchNo || 'None'}
                            </div>
                          )}
                          <input
                            type="text"
                            className="form-control"
                            style={{
                              height: "34px",
                              fontSize: "12px",
                              textAlign: "center",
                            }}
                            value={child.batchNo}
                            onChange={(e) =>
                              handleChildChange(
                                child.id,
                                "batchNo",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => handleEnterNavigation(e, idx)}
                            placeholder="Batch"
                          />
                        </td>
                        <td style={{ minWidth: "110px", padding: "0 4px" }}>
                          <input
                            type="date"
                            className="form-control"
                            style={{
                              height: "34px",
                              fontSize: "11px",
                              textAlign: "center",
                              padding: "0 4px",
                            }}
                            value={child.expiryDate}
                            onChange={(e) =>
                              handleChildChange(
                                child.id,
                                "expiryDate",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => handleEnterNavigation(e, idx)}
                          />
                        </td>
                        <td style={{ minWidth: "60px", padding: "0 4px" }}>
                          <input
                            type="number"
                            className="form-control"
                            style={{
                              height: "34px",
                              fontSize: "12px",
                              textAlign: "center",
                              padding: "0",
                            }}
                            value={child.purchaseQty}
                            onChange={(e) =>
                              handleChildChange(
                                child.id,
                                "purchaseQty",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => handleEnterNavigation(e, idx)}
                          />
                        </td>
                        <td style={{ minWidth: "60px", padding: "0 4px" }}>
                          <input
                            type="number"
                            className="form-control"
                            style={{
                              height: "34px",
                              fontSize: "12px",
                              textAlign: "center",
                              background: "#fffbeb",
                              padding: "0",
                            }}
                            value={child.freeQty}
                            onChange={(e) =>
                              handleChildChange(
                                child.id,
                                "freeQty",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => handleEnterNavigation(e, idx)}
                            placeholder="1"
                          />
                        </td>
                        <td style={{ minWidth: "90px", padding: "0 4px" }}>
                          <select
                            className="form-control"
                            style={{
                              height: "34px",
                              fontSize: "12px",
                              padding: "0 5px",
                            }}
                            value={child.unit}
                            onChange={(e) =>
                              handleChildChange(
                                child.id,
                                "unit",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => handleEnterNavigation(e, idx)}
                          >
                            {(child.availableUnits &&
                            child.availableUnits.length > 0
                              ? child.availableUnits
                              : ["Bag", "Quintal", "kg"]
                            ).map((uName, i) => (
                              <option key={i} value={uName}>
                                {uName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ minWidth: "90px", padding: "0 4px" }}>
                          <div
                            style={{
                              position: "relative",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <input
                              type="text"
                              className="form-control"
                              style={{
                                height: "34px",
                                fontSize: "12px",
                                paddingRight: "25px",
                                background: "#f8fafc",
                                textAlign: "center",
                              }}
                              value={
                                (child.unit || "")
                                  .trim()
                                  .toLowerCase()
                                  .includes("quintal") ||
                                (child.unit || "").trim().toLowerCase() ===
                                  "qtl" ||
                                (child.unit || "").trim().toLowerCase() ===
                                  "qntl"
                                  ? (parseFloat(child.quantity) / 100).toFixed(
                                      2,
                                    )
                                  : Math.floor(parseFloat(child.quantity))
                              }
                              readOnly
                            />
                            <span
                              style={{
                                position: "absolute",
                                right: "4px",
                                fontSize: "8px",
                                color: "#64748b",
                                fontWeight: "700",
                                pointerEvents: "none",
                              }}
                            >
                              kg
                            </span>
                          </div>
                        </td>
                        <td style={{ minWidth: "100px", padding: "0 4px" }}>
                          <input
                            type="number"
                            className="form-control"
                            style={{
                              height: "34px",
                              fontSize: "12px",
                              textAlign: "center",
                            }}
                            value={child.purchasePrice}
                            onChange={(e) =>
                              handleChildChange(
                                child.id,
                                "purchasePrice",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => handleEnterNavigation(e, idx)}
                          />
                        </td>
                        <td style={{ minWidth: "100px", padding: "0 4px" }}>
                          <input
                            type="number"
                            className="form-control"
                            style={{
                              height: "34px",
                              fontSize: "12px",
                              textAlign: "center",
                            }}
                            value={child.salePrice}
                            onChange={(e) =>
                              handleChildChange(
                                child.id,
                                "salePrice",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => handleEnterNavigation(e, idx)}
                          />
                        </td>
                        <td style={{ minWidth: "130px", padding: "0 4px" }}>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <select
                              className="form-control"
                              style={{
                                width: "50px",
                                height: "34px",
                                fontSize: "13px",
                                padding: "0 8px",
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                                borderRight: 0,
                              }}
                              value={child.discountType}
                              onChange={(e) =>
                                handleChildChange(
                                  child.id,
                                  "discountType",
                                  e.target.value,
                                )
                              }
                              onKeyDown={(e) => handleEnterNavigation(e, idx)}
                            >
                              <option value="%">%</option>
                              <option value="Amt">₹</option>
                            </select>
                            <input
                              type="number"
                              className="form-control"
                              style={{
                                height: "34px",
                                fontSize: "12px",
                                width: "80px",
                                textAlign: "center",
                                padding: "0 2px",
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                              }}
                              value={child.discountValue}
                              onChange={(e) =>
                                handleChildChange(
                                  child.id,
                                  "discountValue",
                                  e.target.value,
                                )
                              }
                              onKeyDown={(e) => handleEnterNavigation(e, idx)}
                            />
                          </div>
                        </td>
                        <td style={{ minWidth: "70px", padding: "0 4px" }}>
                          <input
                            type="number"
                            className="form-control"
                            style={{
                              height: "34px",
                              fontSize: "12px",
                              textAlign: "center",
                            }}
                            value={child.taxPercent}
                            onChange={(e) =>
                              handleChildChange(
                                child.id,
                                "taxPercent",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => handleEnterNavigation(e, idx)}
                          />
                        </td>
                        <td
                          style={{
                            minWidth: "100px",
                            fontSize: "13px",
                            fontWeight: "800",
                            color: "#22c55e",
                            textAlign: "right",
                            paddingRight: "15px",
                          }}
                        >
                          ₹{child.totalAmount.toFixed(2)}
                        </td>
                        <td style={{ minWidth: "40px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => removeChildRow(child.id)}
                            style={{
                              border: "none",
                              background: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 8fr) minmax(0, 4fr)",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      background: "#eff6ff",
                      padding: "6px",
                      borderRadius: "8px",
                    }}
                  >
                    <CreditCard size={18} color="#2563eb" />
                  </div>
                  <h3
                    style={{
                      fontSize: "14px",
                      margin: "0",
                      fontWeight: "800",
                      color: "#1e293b",
                      letterSpacing: "0.05em",
                    }}
                  >
                    PAYMENT INFO
                  </h3>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: "15px",
                  }}
                >
                  {/* Row 1: 4 Fields */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "4px",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        fontWeight: "700",
                        fontSize: "12px",
                        padding: "0px 0px",
                        borderRadius: "6px",
                        minWidth: "85px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <select
                        style={{
                          border: "none",
                          background: "transparent",
                          fontWeight: "700",
                          fontSize: "12px",
                          color: "#475569",
                          padding: "8px 5px",
                          outline: "none",
                          cursor: "pointer",
                          width: "100%",
                          textAlign: "center",
                        }}
                        value={master.discountType}
                        onChange={(e) =>
                          handleMasterChange("discountType", e.target.value)
                        }
                      >
                        <option value="%">Disc %</option>
                        <option value="Amt">Disc ₹</option>
                      </select>
                    </div>
                    <input
                      type="number"
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "8px",
                        flex: 1,
                        outline: "none",
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#0f172a",
                        minWidth: 0,
                      }}
                      value={master.discount}
                      onChange={(e) =>
                        handleMasterChange("discount", e.target.value)
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "4px",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        fontWeight: "700",
                        fontSize: "12px",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        minWidth: "85px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Cash Amt
                    </div>
                    <input
                      type="number"
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "8px",
                        flex: 1,
                        outline: "none",
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#0f172a",
                        minWidth: 0,
                      }}
                      value={master.cashAmount}
                      onChange={(e) =>
                        handleMasterChange("cashAmount", e.target.value)
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "4px",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        fontWeight: "700",
                        fontSize: "12px",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        minWidth: "85px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      UPI Amt
                    </div>
                    <input
                      type="number"
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "8px",
                        flex: 1,
                        outline: "none",
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#0f172a",
                        minWidth: 0,
                      }}
                      value={master.upiAmount}
                      onChange={(e) =>
                        handleMasterChange("upiAmount", e.target.value)
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "4px",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        fontWeight: "700",
                        fontSize: "12px",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        minWidth: "85px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Swipe Amt
                    </div>
                    <input
                      type="number"
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "8px",
                        flex: 1,
                        outline: "none",
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#0f172a",
                        minWidth: 0,
                      }}
                      value={master.swipeAmount}
                      onChange={(e) =>
                        handleMasterChange("swipeAmount", e.target.value)
                      }
                    />
                  </div>

                  {/* Row 2: 2 Fields (spanning 2 columns each) */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #fecaca",
                      borderRadius: "10px",
                      padding: "4px",
                      background: "#fff1f2",
                      gridColumn: "span 2",
                    }}
                  >
                    <div
                      style={{
                        background: "#fee2e2",
                        color: "#ef4444",
                        fontWeight: "700",
                        fontSize: "13px",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        minWidth: "110px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Pending
                    </div>
                    <input
                      type="number"
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "8px 12px",
                        flex: 1,
                        outline: "none",
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#ef4444",
                        minWidth: 0,
                      }}
                      value={master.dueAmount}
                      readOnly
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #bbf7d0",
                      borderRadius: "10px",
                      padding: "4px",
                      background: "#f0fdf4",
                      gridColumn: "span 2",
                    }}
                  >
                    <div
                      style={{
                        background: "#dcfce7",
                        color: "#16a34a",
                        fontWeight: "700",
                        fontSize: "13px",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        minWidth: "110px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Paid Amt
                    </div>
                    <input
                      type="number"
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "8px 12px",
                        flex: 1,
                        outline: "none",
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#16a34a",
                        minWidth: 0,
                      }}
                      value={master.paidAmount}
                      readOnly
                    />
                  </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#475569",
                      marginBottom: "5px",
                      display: "block",
                    }}
                  >
                    Remark / Internal Notes
                  </label>
                  <textarea
                    className="form-control"
                    style={{
                      height: "80px",
                      background: "#ffffff",
                    }}
                    value={master.remark}
                    onChange={(e) =>
                      handleMasterChange("remark", e.target.value)
                    }
                    placeholder="Enter any specific details about this purchase..."
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  background: "#f0fdf4",
                  borderRadius: "12px",
                  border: "1px solid #dcfce7",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    margin: "0 0 15px 0",
                    fontWeight: "800",
                    color: "#16a34a",
                  }}
                >
                  Bill Summary
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      color: "#334155",
                    }}
                  >
                    <span>Subtotal</span>
                    <span style={{ fontWeight: "600" }}>
                      ₹{(parseFloat(master.subtotal) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      color: "#334155",
                    }}
                  >
                    <span>Tax Amount</span>
                    <span style={{ fontWeight: "600" }}>
                      ₹{(parseFloat(master.totalTaxAmount) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      color: "#334155",
                    }}
                  >
                    <span>Discount</span>
                    <span style={{ fontWeight: "600" }}>
                      -₹{(parseFloat(master.discount) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      color: "#94a3b8",
                    }}
                  >
                    <span>Round Off</span>
                    <span>
                      {parseFloat(master.roundOff) >= 0 ? "+" : ""}
                      {master.roundOff || "0.00"}
                    </span>
                  </div>

                  <div
                    style={{
                      height: "1px",
                      background: "#dcfce7",
                      margin: "10px 0",
                    }}
                  ></div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "800",
                        color: "#16a34a",
                      }}
                    >
                      Grand Total
                    </span>
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: "900",
                        color: "#16a34a",
                      }}
                    >
                      ₹{(parseFloat(master.grandTotal) || 0).toFixed(2)}
                    </span>
                  </div>

                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "20px" }}
                  >
                    <button
                      className="btn-agro btn-outline"
                      onClick={() => navigate("/purchase/bills")}
                      style={{
                        flex: 1,
                        height: "42px",
                        fontSize: "14px",
                        fontWeight: "700",
                        borderRadius: "8px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        color: "#0f172a",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-agro btn-primary"
                      onClick={handleSubmit}
                      style={{
                        flex: 1,
                        height: "42px",
                        fontSize: "14px",
                        fontWeight: "700",
                        borderRadius: "8px",
                        background: "#16a34a",
                        border: "none",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Save size={18} /> Save Bill
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Breakdown Table */}
          <div style={{ marginTop: "20px", marginBottom: "15px" }}>
            <h3
              style={{
                fontSize: "13px",
                marginBottom: "8px",
                fontWeight: "700",
                color: "var(--primary)",
              }}
            >
              Tax Breakdown (CGST & SGST)
            </h3>
            <div
              style={{
                border: "1px solid #94a3b8",
                borderRadius: "8px",
                overflow: "hidden",
                background: "#ffffff",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "12px",
                }}
              >
                <thead
                  style={{
                    background: "#ffffff",
                    borderBottom: "1px solid #94a3b8",
                  }}
                >
                  <tr>
                    <th
                      rowSpan="2"
                      style={{
                        padding: "6px 10px",
                        textAlign: "left",
                        borderRight: "1px solid #94a3b8",
                      }}
                    >
                      HSN/SAC
                    </th>
                    <th
                      rowSpan="2"
                      style={{
                        padding: "6px 10px",
                        textAlign: "left",
                        borderRight: "1px solid #94a3b8",
                      }}
                    >
                      Tax Rate
                    </th>
                    <th
                      colSpan="2"
                      style={{
                        padding: "3px",
                        textAlign: "center",
                        borderRight: "1px solid #94a3b8",
                        borderBottom: "1px solid #94a3b8",
                      }}
                    >
                      CGST
                    </th>
                    <th
                      colSpan="2"
                      style={{
                        padding: "3px",
                        textAlign: "center",
                        borderRight: "1px solid #94a3b8",
                        borderBottom: "1px solid #94a3b8",
                      }}
                    >
                      SGST / UTGST
                    </th>
                    <th
                      rowSpan="2"
                      style={{ padding: "6px 10px", textAlign: "right" }}
                    >
                      Total Tax
                    </th>
                  </tr>
                  <tr>
                    <th
                      style={{
                        padding: "3px",
                        textAlign: "center",
                        borderRight: "1px solid #94a3b8",
                        fontWeight: "600",
                      }}
                    >
                      Rate
                    </th>
                    <th
                      style={{
                        padding: "3px",
                        textAlign: "center",
                        borderRight: "1px solid #94a3b8",
                        fontWeight: "600",
                      }}
                    >
                      Amount
                    </th>
                    <th
                      style={{
                        padding: "3px",
                        textAlign: "center",
                        borderRight: "1px solid #94a3b8",
                        fontWeight: "600",
                      }}
                    >
                      Rate
                    </th>
                    <th
                      style={{
                        padding: "3px",
                        textAlign: "center",
                        borderRight: "1px solid #94a3b8",
                        fontWeight: "600",
                      }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(
                    children.reduce((acc, item) => {
                      if (!item.productId) return acc;
                      const rate = parseFloat(item.taxPercent) || 0;
                      const hsn = item.hsnCode || "N/A";
                      const key = `${hsn}-${rate}`;
                      if (!acc[key]) {
                        acc[key] = {
                          hsn,
                          rate,
                          cgstAmount: 0,
                          sgstAmount: 0,
                          totalTax: 0,
                        };
                      }
                      const itemTax =
                        ((parseFloat(item.purchasePrice) || 0) *
                          (parseFloat(item.purchaseQty) || 0) *
                          rate) /
                        100;
                      acc[key].cgstAmount += itemTax / 2;
                      acc[key].sgstAmount += itemTax / 2;
                      acc[key].totalTax += itemTax;
                      return acc;
                    }, {}),
                  ).map((tax, i, arr) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom:
                          i === arr.length - 1 ? "none" : "1px solid #94a3b8",
                      }}
                    >
                      <td
                        style={{
                          padding: "6px 10px",
                          borderRight: "1px solid #94a3b8",
                        }}
                      >
                        {tax.hsn}
                      </td>
                      <td
                        style={{
                          padding: "6px 10px",
                          borderRight: "1px solid #94a3b8",
                        }}
                      >
                        {tax.rate}%
                      </td>
                      <td
                        style={{
                          padding: "6px",
                          textAlign: "center",
                          borderRight: "1px solid #94a3b8",
                        }}
                      >
                        {(tax.rate / 2).toFixed(2)}%
                      </td>
                      <td
                        style={{
                          padding: "6px",
                          textAlign: "center",
                          borderRight: "1px solid #94a3b8",
                        }}
                      >
                        ₹{tax.cgstAmount.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "6px",
                          textAlign: "center",
                          borderRight: "1px solid #94a3b8",
                        }}
                      >
                        {(tax.rate / 2).toFixed(2)}%
                      </td>
                      <td
                        style={{
                          padding: "6px",
                          textAlign: "center",
                          borderRight: "1px solid #94a3b8",
                        }}
                      >
                        ₹{tax.sgstAmount.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "6px 10px",
                          textAlign: "right",
                          fontWeight: "700",
                        }}
                      >
                        ₹{tax.totalTax.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {children.filter((c) => c.productId).length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          padding: "10px",
                          textAlign: "center",
                          color: "#64748b",
                          fontStyle: "italic",
                        }}
                      >
                        No products added yet
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot
                  style={{
                    background: "#f1f5f9",
                    fontWeight: "800",
                    borderTop: "1px solid #94a3b8",
                  }}
                >
                  <tr>
                    <td
                      style={{
                        padding: "6px 10px",
                        borderRight: "1px solid #94a3b8",
                      }}
                    >
                      Total
                    </td>
                    <td style={{ borderRight: "1px solid #94a3b8" }}></td>
                    <td style={{ borderRight: "1px solid #94a3b8" }}></td>
                    <td
                      style={{
                        padding: "6px",
                        textAlign: "center",
                        borderRight: "1px solid #94a3b8",
                      }}
                    >
                      ₹
                      {(
                        children.reduce(
                          (sum, item) =>
                            sum +
                            ((parseFloat(item.purchasePrice) || 0) *
                              (parseFloat(item.purchaseQty) || 0) *
                              (parseFloat(item.taxPercent) || 0)) /
                              100,
                          0,
                        ) / 2
                      ).toFixed(2)}
                    </td>
                    <td style={{ borderRight: "1px solid #94a3b8" }}></td>
                    <td
                      style={{
                        padding: "6px",
                        textAlign: "center",
                        borderRight: "1px solid #94a3b8",
                      }}
                    >
                      ₹
                      {(
                        children.reduce(
                          (sum, item) =>
                            sum +
                            ((parseFloat(item.purchasePrice) || 0) *
                              (parseFloat(item.purchaseQty) || 0) *
                              (parseFloat(item.taxPercent) || 0)) /
                              100,
                          0,
                        ) / 2
                      ).toFixed(2)}
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "right" }}>
                      ₹
                      {children
                        .reduce(
                          (sum, item) =>
                            sum +
                            ((parseFloat(item.purchasePrice) || 0) *
                              (parseFloat(item.purchaseQty) || 0) *
                              (parseFloat(item.taxPercent) || 0)) /
                              100,
                          0,
                        )
                        .toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseEntry;
