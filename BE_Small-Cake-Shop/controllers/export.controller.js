const { Order, OrderItem, Product, User } = require('../models');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const XLSX = require('xlsx');

module.exports = {

  // Export semua order ke Excel (SheetJS)
  exportExcel: async (req, res) => {
    try {
      const orders = await Order.findAll({
        include: [
          { model: User,      attributes: ['name', 'email'] },
          { model: OrderItem, include: [{ model: Product, attributes: ['name'] }] }
        ],
        order: [['createdAt', 'DESC']]
      });

      // bentuk data menjadi array of object
      const data = orders.map((order, index) => ({
        'No'                : index + 1,
        'Order Number'      : order.order_number,
        'Nama Pelanggan'    : order.User.name,
        'Email'             : order.User.email,
        'Produk'            : order.OrderItems.map(i => `${i.Product.name} x${i.quantity}`).join(', '),
        'Total Harga (Rp)'  : Number(order.total_amount),
        'Status'            : order.status,
        'Alamat Pengiriman' : order.shipping_address,
        'Tanggal Order'     : new Date(order.createdAt).toLocaleString('id-ID')
      }));

      const worksheet  = XLSX.utils.json_to_sheet(data);
      const workbook   = XLSX.utils.book_new();

      // lebar kolom
      worksheet['!cols'] = [
        { wch: 5  },
        { wch: 24 },
        { wch: 22 },
        { wch: 28 },
        { wch: 45 },
        { wch: 18 },
        { wch: 14 },
        { wch: 36 },
        { wch: 22 }
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Order');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Data_Order_Small_Cake_Shop.xlsx');
      return res.send(buffer);
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'server error', data: error.message });
    }
  },

  // Export semua order ke PDF (jsPDF + autotable)
  exportPdf: async (req, res) => {
    try {
      const orders = await Order.findAll({
        include: [
          { model: User,      attributes: ['name', 'email'] },
          { model: OrderItem, include: [{ model: Product, attributes: ['name'] }] }
        ],
        order: [['createdAt', 'DESC']]
      });

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // HEADER
      doc.setFillColor(31, 56, 100);
      doc.rect(0, 0, 297, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Small Cake Shop', 14, 10);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Laporan Data Order', 14, 16);
      doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 200, 16);

      // TABEL
      const tableData = orders.map((order, index) => [
        index + 1,
        order.order_number,
        `${order.User.name}\n${order.User.email}`,
        order.OrderItems.map(i => `${i.Product.name} x${i.quantity}`).join('\n'),
        `Rp ${Number(order.total_amount).toLocaleString('id-ID')}`,
        order.status,
        new Date(order.createdAt).toLocaleDateString('id-ID')
      ]);

      doc.autoTable({
        startY       : 26,
        head         : [['No', 'Order Number', 'Pelanggan', 'Produk', 'Total', 'Status', 'Tanggal']],
        body         : tableData,
        theme        : 'grid',
        styles       : { fontSize: 7.5, cellPadding: 3, valign: 'middle', font: 'helvetica' },
        headStyles   : { fillColor: [31, 56, 100], textColor: 255, fontStyle: 'bold', halign: 'center' },
        alternateRowStyles : { fillColor: [240, 244, 250] },
        columnStyles : {
          0: { halign: 'center', cellWidth: 10  },
          1: { cellWidth: 46 },
          2: { cellWidth: 44 },
          3: { cellWidth: 68 },
          4: { cellWidth: 34 },
          5: { halign: 'center', cellWidth: 24 },
          6: { halign: 'center', cellWidth: 26 }
        },
        margin       : { left: 14, right: 14 },
        didDrawPage  : (data) => {
          // footer tiap halaman
          doc.setFontSize(7);
          doc.setTextColor(150);
          doc.text(
            `Halaman ${data.pageNumber} — Total Order: ${orders.length}`,
            14,
            doc.internal.pageSize.height - 6
          );
        }
      });

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=Data_Order_Small_Cake_Shop.pdf');
      return res.send(pdfBuffer);
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'server error', data: error.message });
    }
  }

};