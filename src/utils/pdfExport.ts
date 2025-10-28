import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export const exportGuestListPDF = (guests: Guest[], currency: string) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Lista de Convidados', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, 14, 28);
  doc.text(`Total: ${guests.length} convidados`, 14, 34);
  doc.text(`Confirmados: ${guests.filter(g => g.confirmed).length}`, 14, 40);
  
  // Table
  autoTable(doc, {
    startY: 48,
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

export const exportBudgetPDF = (categories: BudgetCategory[], currency: string) => {
  const doc = new jsPDF();
  
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budgeted_amount, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent_amount, 0);
  const remaining = totalBudget - totalSpent;
  
  // Header
  doc.setFontSize(20);
  doc.text('Resumo de Orçamento', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, 14, 28);
  
  // Summary
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Orçamento Total: ${totalBudget.toFixed(2)} ${currency}`, 14, 40);
  doc.text(`Total Gasto: ${totalSpent.toFixed(2)} ${currency}`, 14, 48);
  
  doc.setTextColor(remaining >= 0 ? 0 : 255, remaining >= 0 ? 128 : 0, 0);
  doc.text(`Saldo: ${remaining.toFixed(2)} ${currency}`, 14, 56);
  doc.setTextColor(0, 0, 0);
  
  // Table
  autoTable(doc, {
    startY: 64,
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

export const exportTimelinePDF = (tasks: TimelineTask[]) => {
  const doc = new jsPDF();
  
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  
  // Header
  doc.setFontSize(20);
  doc.text('Cronograma de Tarefas', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, 14, 28);
  doc.text(`Total: ${tasks.length} tarefas`, 14, 34);
  doc.text(`Concluídas: ${completed} | Pendentes: ${pending}`, 14, 40);
  
  // Table
  autoTable(doc, {
    startY: 48,
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

export const exportCeremonyRolesPDF = (roles: CeremonyRole[]) => {
  const doc = new jsPDF();
  
  const groomRoles = roles.filter(r => r.side === 'noivo');
  const brideRoles = roles.filter(r => r.side === 'noiva');
  
  // Header
  doc.setFontSize(20);
  doc.text('Lista de Papéis na Cerimônia', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, 14, 28);
  doc.text(`Total: ${roles.length} pessoas`, 14, 34);
  doc.text(`Confirmados: ${roles.filter(r => r.confirmed).length}`, 14, 40);
  
  let currentY = 48;
  
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
