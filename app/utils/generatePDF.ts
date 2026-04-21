import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { db, Transaction, Debt } from '@/lib/db';

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

export const generateMonthlyPDF = async (month: number, year: number) => {
  // Pad month to 2 digits for query
  const strMonth = month.toString().padStart(2, '0');
  
  // 1. Fetch from Dexie
  const transactions = await db.transactions
    .where('date')
    .between(`${year}-${strMonth}-01`, `${year}-${strMonth}-31`)
    .toArray();

  const debts = await db.debts
    .where('status')
    .notEqual('paid')
    .toArray();

  const savingsGoals = await db.savingsGoals.toArray();
  const settings = await db.settings.toArray();
  const userName = settings[0]?.userName || 'Usuario';

  // 2. Compute sums
  const income: Transaction[] = [];
  const expenses: Transaction[] = [];
  
  transactions.forEach(t => {
    if (t.type === 'income') income.push(t);
    else if (t.type === 'expense') expenses.push(t);
  });

  const totalIncome = income.reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Expenses grouped by category
  const categoriesMap = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoriesMap)
    .sort((a, b) => b[1] - a[1]);

  const monthName = new Date(year, month - 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  // 3. Build HTML Template
  const htmlContent = `
    <div id="pdf-report" style="
      width: 794px;
      background: #0A0A0A;
      color: #FFFFFF;
      font-family: 'Inter', sans-serif;
      padding: 48px;
    ">
      <!-- HEADER -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:24px; border-bottom:1px solid #222;">
        <div>
          <div style="font-family:'Space Grotesk',sans-serif; font-size:32px; font-weight:700; color:#00FF88; letter-spacing:-1px;">
            FinanzApp
          </div>
          <div style="font-size:12px; color:#52525B; margin-top:4px;">
            Tu soberanía financiera personal
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; color:#52525B; text-transform:uppercase; letter-spacing:1px;">Reporte de ${userName}</div>
          <div style="font-family:'Space Grotesk',sans-serif; text-transform: capitalize; font-size:20px; font-weight:600; margin-top:4px;">${monthName}</div>
        </div>
      </div>

      <!-- CARDS RESUMEN -->
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin:32px 0;">
        <!-- Card Ingresos -->
        <div style="background:#111; border:1px solid #222; border-radius:12px; padding:20px;">
          <div style="font-size:11px; color:#52525B; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Ingresos</div>
          <div style="font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:700; color:#00FF88;">${formatCurrency(totalIncome)}</div>
          <div style="font-size:11px; color:#52525B; margin-top:4px;">${income.length} movimientos</div>
        </div>
        <!-- Card Gastos -->
        <div style="background:#111; border:1px solid #222; border-radius:12px; padding:20px;">
          <div style="font-size:11px; color:#52525B; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Gastos</div>
          <div style="font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:700; color:#EF4444;">${formatCurrency(totalExpenses)}</div>
          <div style="font-size:11px; color:#52525B; margin-top:4px;">${expenses.length} movimientos</div>
        </div>
        <!-- Card Balance -->
        <div style="background:#111; border:1px solid ${balance >= 0 ? '#00FF8840' : '#EF444440'}; border-radius:12px; padding:20px; box-shadow:0 0 20px ${balance >= 0 ? '#00FF8815' : '#EF444415'};">
          <div style="font-size:11px; color:#52525B; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Balance neto</div>
          <div style="font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:700; color:${balance >= 0 ? '#00FF88' : '#EF4444'};">${formatCurrency(balance)}</div>
          <div style="font-size:11px; color:#52525B; margin-top:4px;">${balance >= 0 ? '✓ Mes positivo' : '⚠ Mes negativo'}</div>
        </div>
      </div>

      <!-- SECCIÓN INGRESOS -->
      ${income.length > 0 ? `
      <div style="margin-bottom:32px;">
        <div style="font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:600; color:#00FF88; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:16px; display:flex; align-items:center; gap:12px;">
          Ingresos del mes
          <div style="flex:1; height:1px; background:#222;"></div>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#111; border-bottom:1px solid #222;">
              <th style="padding:10px 12px; text-align:left; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Fecha</th>
              <th style="padding:10px 12px; text-align:left; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Categoría</th>
              <th style="padding:10px 12px; text-align:left; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Descripción</th>
              <th style="padding:10px 12px; text-align:right; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Monto</th>
            </tr>
          </thead>
          <tbody>
            ${income.map(t => `
              <tr style="border-bottom:1px solid #1A1A1A;">
                <td style="padding:10px 12px; color:#A1A1AA;">${formatDate(t.date)}</td>
                <td style="padding:10px 12px; color:#A1A1AA; text-transform: capitalize;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#00FF88;margin-right:8px;"></span>${t.category}
                </td>
                <td style="padding:10px 12px; color:#A1A1AA;">${t.description || '—'}</td>
                <td style="padding:10px 12px; text-align:right; font-family:'Space Grotesk',sans-serif; font-weight:600; color:#00FF88;">${formatCurrency(t.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- SECCIÓN GASTOS -->
      ${expenses.length > 0 ? `
      <div style="margin-bottom:32px;">
        <div style="font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:600; color:#EF4444; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:16px; display:flex; align-items:center; gap:12px;">
          Gastos del mes
          <div style="flex:1; height:1px; background:#222;"></div>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#111; border-bottom:1px solid #222;">
              <th style="padding:10px 12px; text-align:left; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Fecha</th>
              <th style="padding:10px 12px; text-align:left; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Categoría</th>
              <th style="padding:10px 12px; text-align:left; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Descripción</th>
              <th style="padding:10px 12px; text-align:right; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Monto</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(t => `
              <tr style="border-bottom:1px solid #1A1A1A;">
                <td style="padding:10px 12px; color:#A1A1AA;">${formatDate(t.date)}</td>
                <td style="padding:10px 12px; color:#A1A1AA; text-transform: capitalize;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#EF4444;margin-right:8px;"></span>${t.category}
                </td>
                <td style="padding:10px 12px; color:#A1A1AA;">${t.description || '—'}</td>
                <td style="padding:10px 12px; text-align:right; font-family:'Space Grotesk',sans-serif; font-weight:600; color:#EF4444;">${formatCurrency(t.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

       <!-- SECCIÓN GASTOS POR CATEGORÍA -->
       ${sortedCategories.length > 0 ? `
        <div style="margin-bottom:32px;">
          <div style="font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:600; color:#FBBF24; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:16px; display:flex; align-items:center; gap:12px;">
            Resumen de Gastos
            <div style="flex:1; height:1px; background:#222;"></div>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#111; border-bottom:1px solid #222;">
                <th style="padding:10px 12px; text-align:left; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Categoría</th>
                <th style="padding:10px 12px; text-align:right; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">% del Total</th>
                <th style="padding:10px 12px; text-align:right; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Monto Total</th>
              </tr>
            </thead>
            <tbody>
              ${sortedCategories.map(([cat, amt]) => `
                <tr style="border-bottom:1px solid #1A1A1A;">
                  <td style="padding:10px 12px; color:#A1A1AA; text-transform: capitalize;">${cat}</td>
                  <td style="padding:10px 12px; color:#A1A1AA; text-align: right;">${Math.round((amt / totalExpenses) * 100)}%</td>
                  <td style="padding:10px 12px; text-align:right; font-family:'Space Grotesk',sans-serif; font-weight:600; color:#FFF;">${formatCurrency(amt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
       ` : ''}

      <!-- SECCIÓN DEUDAS PENDIENTES -->
      ${debts.length > 0 ? `
      <div style="margin-bottom:32px;">
        <div style="font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:600; color:#60A5FA; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:16px; display:flex; align-items:center; gap:12px;">
          Balance de Deudas Pendientes
          <div style="flex:1; height:1px; background:#222;"></div>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#111; border-bottom:1px solid #222;">
              <th style="padding:10px 12px; text-align:left; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Persona</th>
              <th style="padding:10px 12px; text-align:left; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Vencimiento</th>
              <th style="padding:10px 12px; text-align:left; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Estado / Progreso</th>
              <th style="padding:10px 12px; text-align:right; font-size:11px; color:#52525B; text-transform:uppercase; font-weight:600; letter-spacing:0.8px;">Total Deuda</th>
            </tr>
          </thead>
          <tbody>
            ${debts.map((d: Debt) => {
              const pending = d.total_amount - d.paid_amount;
              const isPartial = d.status === 'partial';
              const badgeColor = isPartial ? '#60A5FA' : '#FBBF24';
              const badgeText = isPartial ? 'Parcial' : 'Pendiente';
              const bgBadge = isPartial ? '#60A5FA20' : '#FBBF2420';

              return `
                <tr style="border-bottom:1px solid #1A1A1A;">
                  <td style="padding:10px 12px; color:#FFF; font-weight:600;">${d.person_name}</td>
                  <td style="padding:10px 12px; color:#A1A1AA;">${d.due_date ? formatDate(d.due_date) : '-'}</td>
                  <td style="padding:10px 12px; color:#A1A1AA;">
                    <span style="display:inline-block; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold; text-transform:uppercase; color:${badgeColor}; background:${bgBadge};">
                      ${badgeText} (${formatCurrency(pending)})
                    </span>
                  </td>
                  <td style="padding:10px 12px; text-align:right; font-family:'Space Grotesk',sans-serif; font-weight:600; color:#FFF;">${formatCurrency(d.total_amount)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- SECCIÓN METAS DE AHORRO -->
      ${savingsGoals.length > 0 ? `
      <div style="margin-bottom:32px;">
        <div style="font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:600; color:#00FF88; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:16px; display:flex; align-items:center; gap:12px;">
          Metas de Ahorro y Objetivos
          <div style="flex:1; height:1px; background:#222;"></div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:16px;">
          ${savingsGoals.map(goal => {
            const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
            return `
              <div style="background:#111; border:1px solid #222; border-radius:12px; padding:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                  <div style="font-size:18px;">${goal.emoji} <span style="font-size:14px; color:#FFF; font-weight:600; margin-left:8px;">${goal.name}</span></div>
                  <div style="font-size:12px; color:${goal.color}; font-weight:bold;">${pct}%</div>
                </div>
                <div style="width:100%; height:6px; background:#222; border-radius:3px; overflow:hidden; margin-bottom:12px;">
                  <div style="width:${pct}%; height:100%; background:${goal.color};"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:11px; color:#52525B;">
                  <span>${formatCurrency(goal.current_amount)}</span>
                  <span>Meta: ${formatCurrency(goal.target_amount)}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      ` : ''}

      <!-- FOOTER -->
      <div style="margin-top:48px; padding-top:20px; border-top:1px solid #1A1A1A; display:flex; justify-content:space-between; align-items:center;">
        <div style="font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:600; color:#00FF88;">FinanzApp Local</div>
        <div style="font-size:11px; color:#52525B;">Generado el ${new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' })}</div>
      </div>
    </div>
  `;

  // 4. Inyectar temporalmente en DOM
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    const reportElem = document.getElementById('pdf-report');
    if (!reportElem) throw new Error('Elemento reporte no encontrado');

    // 5. Capturar con html2canvas
    const canvas = await html2canvas(reportElem, {
      backgroundColor: '#0A0A0A',
      scale: 2, 
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // 6. Generar jsPDF
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    // A4 aspect ratio 
    const pageHeight = (canvas.height * pageWidth) / canvas.width;
    
    // Check if the content is longer than 1 page
    const actualHeight = pdf.internal.pageSize.getHeight();
    
    let position = 0;
    let heightLeft = pageHeight;

    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pageHeight);
    heightLeft -= actualHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pageHeight);
      heightLeft -= actualHeight;
    }

    pdf.save(`reporte-finanzas-${strMonth}-${year}.pdf`);
  } catch (err) {
    console.error('Error generando PDF', err);
    throw err;
  } finally {
    // 7. Cleanup
    document.body.removeChild(container);
  }
};
