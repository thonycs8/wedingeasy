import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface WeddingHeaderData {
  coupleName?: string;
  partnerName?: string;
  weddingDate?: string;
}

const addWeddingHeader = (doc: jsPDF, title: string, headerData?: WeddingHeaderData) => {
  // Wedding header with couple names
  if (headerData?.coupleName && headerData?.partnerName) {
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(219, 39, 119); // Primary color
    doc.text(`${headerData.coupleName} & ${headerData.partnerName}`, 14, 15);
    
    if (headerData.weddingDate) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      const formattedDate = new Date(headerData.weddingDate).toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      doc.text(formattedDate, 14, 22);
    }
    
    // Decorative line
    doc.setDrawColor(219, 39, 119);
    doc.setLineWidth(0.5);
    doc.line(14, 26, 196, 26);
    
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(title, 14, 35);
    
    return 43; // Starting Y position for content
  } else {
    // Fallback to simple header
    doc.setFontSize(20);
    doc.text(title, 14, 20);
    return 28;
  }
};

interface Guest {
  name: string;
  category: string;
  email?: string;
  phone?: string;
  confirmed: boolean;
  plus_one: boolean;
  dietary_restrictions?: string;
  table_number?: number;
  special_role?: string;
}

interface BudgetCategory {
  name: string;
  budgeted_amount: number;
  spent_amount: number;
  priority: string;
}

interface TimelineTask {
  title: string;
  description?: string;
  due_date: string;
  priority: string;
  category: string;
  completed: boolean;
}

export const exportGuestListPDF = (guests: Guest[], currency: string, headerData?: WeddingHeaderData) => {
  const doc = new jsPDF();
  
  // Header
  let startY = addWeddingHeader(doc, 'Lista de Convidados', headerData);
  
  doc.setFontSize(10);
  doc.text(`Data de Exportação: ${new Date().toLocaleDateString('pt-PT')}`, 14, startY);
  doc.text(`Total: ${guests.length} convidados`, 14, startY + 6);
  doc.text(`Confirmados: ${guests.filter(g => g.confirmed).length}`, 14, startY + 12);
  
  startY += 20;
  
  // Table
  autoTable(doc, {
    startY: startY,
    head: [['Nome', 'Categoria', 'Email', 'Telefone', 'Confirmado', '+1', 'Mesa']],
    body: guests.map(guest => [
      guest.name,
      guest.category,
      guest.email || '-',
      guest.phone || '-',
      guest.confirmed ? 'Sim' : 'Não',
      guest.plus_one ? 'Sim' : 'Não',
      guest.table_number?.toString() || '-'
    ]),
    headStyles: {
      fillColor: [219, 39, 119],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [253, 242, 248]
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    }
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save('lista-convidados.pdf');
};

export const exportBudgetPDF = (categories: BudgetCategory[], currency: string, headerData?: WeddingHeaderData) => {
  const doc = new jsPDF();
  
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budgeted_amount, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent_amount, 0);
  const remaining = totalBudget - totalSpent;
  
  // Header
  let startY = addWeddingHeader(doc, 'Resumo de Orçamento', headerData);
  
  doc.setFontSize(10);
  doc.text(`Data de Exportação: ${new Date().toLocaleDateString('pt-PT')}`, 14, startY);
  
  startY += 8;
  
  // Summary
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Orçamento Total: ${totalBudget.toFixed(2)} ${currency}`, 14, startY);
  doc.text(`Total Gasto: ${totalSpent.toFixed(2)} ${currency}`, 14, startY + 8);
  
  doc.setTextColor(remaining >= 0 ? 0 : 255, remaining >= 0 ? 128 : 0, 0);
  doc.text(`Saldo: ${remaining.toFixed(2)} ${currency}`, 14, startY + 16);
  doc.setTextColor(0, 0, 0);
  
  startY += 24;
  
  // Table
  autoTable(doc, {
    startY: startY,
    head: [['Categoria', 'Orçamentado', 'Gasto', 'Restante', 'Prioridade', '%']],
    body: categories.map(cat => {
      const remaining = cat.budgeted_amount - cat.spent_amount;
      const percentage = cat.budgeted_amount > 0 
        ? ((cat.spent_amount / cat.budgeted_amount) * 100).toFixed(1)
        : '0.0';
      
      return [
        cat.name,
        `${cat.budgeted_amount.toFixed(2)} ${currency}`,
        `${cat.spent_amount.toFixed(2)} ${currency}`,
        `${remaining.toFixed(2)} ${currency}`,
        cat.priority,
        `${percentage}%`
      ];
    }),
    headStyles: {
      fillColor: [219, 39, 119],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [253, 242, 248]
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      5: { halign: 'right' }
    }
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save('orcamento-casamento.pdf');
};

export const exportTimelinePDF = (tasks: TimelineTask[], headerData?: WeddingHeaderData) => {
  const doc = new jsPDF();
  
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  
  // Header
  let startY = addWeddingHeader(doc, 'Cronograma de Tarefas', headerData);
  
  doc.setFontSize(10);
  doc.text(`Data de Exportação: ${new Date().toLocaleDateString('pt-PT')}`, 14, startY);
  doc.text(`Total: ${tasks.length} tarefas`, 14, startY + 6);
  doc.text(`Concluídas: ${completed} | Pendentes: ${pending}`, 14, startY + 12);
  
  startY += 20;
  
  // Table
  autoTable(doc, {
    startY: startY,
    head: [['Tarefa', 'Descrição', 'Data Limite', 'Prioridade', 'Categoria', 'Status']],
    body: tasks.map(task => [
      task.title,
      task.description || '-',
      new Date(task.due_date).toLocaleDateString('pt-PT'),
      task.priority,
      task.category,
      task.completed ? '✓ Concluída' : '○ Pendente'
    ]),
    headStyles: {
      fillColor: [219, 39, 119],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [253, 242, 248]
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      1: { cellWidth: 40 },
      5: { halign: 'center' }
    }
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save('cronograma-casamento.pdf');
};

interface CeremonyRole {
  name: string;
  email?: string;
  phone?: string;
  special_role: string;
  confirmed: boolean;
  side?: 'noivo' | 'noiva' | null;
}

export const exportCeremonyRolesPDF = (roles: CeremonyRole[], headerData?: WeddingHeaderData) => {
  const doc = new jsPDF();
  
  const groomRoles = roles.filter(r => r.side === 'noivo');
  const brideRoles = roles.filter(r => r.side === 'noiva');
  
  // Header
  let currentY = addWeddingHeader(doc, 'Lista de Papéis na Cerimônia', headerData);
  
  doc.setFontSize(10);
  doc.text(`Data de Exportação: ${new Date().toLocaleDateString('pt-PT')}`, 14, currentY);
  doc.text(`Total: ${roles.length} pessoas`, 14, currentY + 6);
  doc.text(`Confirmados: ${roles.filter(r => r.confirmed).length}`, 14, currentY + 12);
  
  currentY += 20;
  
  // Lado do Noivo
  if (groomRoles.length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Lado do Noivo', 14, currentY);
    currentY += 8;
    
    autoTable(doc, {
      startY: currentY,
      head: [['Nome', 'Papel', 'Email', 'Telefone', 'Confirmado']],
      body: groomRoles.map(role => [
        role.name,
        role.special_role,
        role.email || '-',
        role.phone || '-',
        role.confirmed ? 'Sim' : 'Não'
      ]),
      headStyles: {
        fillColor: [219, 39, 119],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [253, 242, 248]
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Lado da Noiva
  if (brideRoles.length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Lado da Noiva', 14, currentY);
    currentY += 8;
    
    autoTable(doc, {
      startY: currentY,
      head: [['Nome', 'Papel', 'Email', 'Telefone', 'Confirmado']],
      body: brideRoles.map(role => [
        role.name,
        role.special_role,
        role.email || '-',
        role.phone || '-',
        role.confirmed ? 'Sim' : 'Não'
      ]),
      headStyles: {
        fillColor: [219, 39, 119],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [253, 242, 248]
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    });
  }
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save('lista-cerimonia.pdf');
};
