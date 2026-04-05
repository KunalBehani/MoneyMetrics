import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateMonthlyReport = (transactions) => {
  const doc = new jsPDF();
  
  // Use all transactions instead of just current month since user wants to see their imported data
  const reportTxns = transactions;

  const totalIncome = reportTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = reportTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netSavings = totalIncome - totalExpense;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(41, 128, 185);
  doc.text('Monthly Financial Report', 14, 22);
  
  // Date
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 30);

  // Summary Section
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Summary', 14, 45);
  
  doc.setFontSize(12);
  doc.text(`Total Income: Rs.${totalIncome.toFixed(2)}`, 14, 55);
  doc.text(`Total Expenses: Rs.${totalExpense.toFixed(2)}`, 14, 63);
  doc.text(`Net Savings: Rs.${netSavings.toFixed(2)}`, 14, 71);

  // Category Breakdown
  const categoryMap = reportTxns.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
  
  doc.setFontSize(16);
  doc.text('Top Spending Categories', 14, 85);
  
  let yPos = 95;
  if(sortedCategories.length > 0) {
    sortedCategories.forEach(([cat, amt]) => {
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`${cat}: Rs.${amt.toFixed(2)}`, 14, yPos);
      yPos += 8;
    });
  } else {
    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text('No expenses recorded this month.', 14, yPos);
    yPos += 8;
  }

  // Transactions Table
  yPos += 10;
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Transactions', 14, yPos);

  const tableData = reportTxns.sort((a,b) => new Date(b.date) - new Date(a.date)).map(t => [
    format(new Date(t.date), 'MMM dd, yyyy'),
    t.title,
    t.category,
    t.type === 'income' ? `+Rs.${Number(t.amount).toFixed(2)}` : `-Rs.${Number(t.amount).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Date', 'Description', 'Category', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    willDrawCell: function (data) {
        if (data.section === 'body' && data.column.index === 3) {
            if (data.cell.raw.startsWith('+')) {
                doc.setTextColor(39, 174, 96); // Green for income
            } else {
                doc.setTextColor(231, 76, 60); // Red for expense
            }
        }
    }
  });

  doc.save(`Financial_Report_${format(new Date(), 'MMM_yyyy')}.pdf`);
};
