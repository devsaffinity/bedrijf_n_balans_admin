import type { Client, ClientDocument, Payment, Submission } from '../types/domain'

export const clients: Client[] = [
  { id: 'c-101', name: 'Sophie de Vries', email: 'sophie.devries@example.nl', phone: '+31 6 1234 5678', status: 'Active', filingType: 'Income tax', joinedAt: '2026-05-12' },
  { id: 'c-102', name: 'Noah Jansen', email: 'noah.jansen@example.nl', phone: '+31 6 2345 6789', status: 'Review needed', filingType: 'Income tax + business', joinedAt: '2026-05-18' },
  { id: 'c-103', name: 'Emma Smit', email: 'emma.smit@example.nl', phone: '+31 6 3456 7890', status: 'Awaiting submission', filingType: 'Income tax', joinedAt: '2026-06-02' },
  { id: 'c-104', name: 'Liam Visser', email: 'liam.visser@example.nl', phone: '+31 6 4567 8901', status: 'Active', filingType: 'Business filing', joinedAt: '2026-06-11' },
  { id: 'c-105', name: 'Mila Bakker', email: 'mila.bakker@example.nl', phone: '+31 6 5678 9012', status: 'Review needed', filingType: 'Income tax', joinedAt: '2026-06-24' },
  { id: 'c-106', name: 'Daan Meijer', email: 'daan.meijer@example.nl', phone: '+31 6 6789 0123', status: 'Active', filingType: 'Income tax + business', joinedAt: '2026-07-03' },
  { id: 'c-107', name: 'Julia Mulder', email: 'julia.mulder@example.nl', phone: '+31 6 7890 1234', status: 'Awaiting submission', filingType: 'Income tax', joinedAt: '2026-07-09' },
]

export const submissions: Submission[] = [
  { id: 'SUB-2026-1042', clientId: 'c-101', clientName: 'Sophie de Vries', clientEmail: 'sophie.devries@example.nl', filingType: 'Income tax', status: 'Pending', progress: 100, submittedAt: '2026-07-21T10:24:00', updatedAt: '2026-07-21T10:24:00', answers: [
    { section: 'Personal details', items: [{ question: 'Tax year', answer: '2025' }, { question: 'Fiscal partner', answer: 'No' }, { question: 'Country of residence', answer: 'Netherlands' }] },
    { section: 'Income', items: [{ question: 'Employment income', answer: 'Yes' }, { question: 'Multiple employers', answer: 'No' }, { question: 'Other income', answer: 'None reported' }] },
    { section: 'Deductions', items: [{ question: 'Deductible healthcare costs', answer: 'Yes — supporting document uploaded' }, { question: 'Charitable donations', answer: 'No' }] },
  ] },
  { id: 'SUB-2026-1041', clientId: 'c-102', clientName: 'Noah Jansen', clientEmail: 'noah.jansen@example.nl', filingType: 'Income tax + business', status: 'Accepted', progress: 100, submittedAt: '2026-07-20T15:08:00', updatedAt: '2026-07-20T15:08:00', answers: [{ section: 'Business details', items: [{ question: 'Business structure', answer: 'Sole proprietorship' }, { question: 'VAT registered', answer: 'Yes' }] }] },
  { id: 'SUB-2026-1040', clientId: 'c-103', clientName: 'Emma Smit', clientEmail: 'emma.smit@example.nl', filingType: 'Income tax', status: 'Pending', progress: 64, submittedAt: null, updatedAt: '2026-07-20T09:12:00', answers: [{ section: 'Personal details', items: [{ question: 'Tax year', answer: '2025' }] }] },
  { id: 'SUB-2026-1039', clientId: 'c-104', clientName: 'Liam Visser', clientEmail: 'liam.visser@example.nl', filingType: 'Business filing', status: 'Pending', progress: 100, submittedAt: '2026-07-18T13:45:00', updatedAt: '2026-07-18T13:45:00', answers: [{ section: 'Business details', items: [{ question: 'Business structure', answer: 'Private limited company' }] }] },
  { id: 'SUB-2026-1038', clientId: 'c-105', clientName: 'Mila Bakker', clientEmail: 'mila.bakker@example.nl', filingType: 'Income tax', status: 'Rejected', progress: 100, submittedAt: '2026-07-16T11:30:00', updatedAt: '2026-07-22T08:20:00', answers: [{ section: 'Personal details', items: [{ question: 'Tax year', answer: '2025' }, { question: 'Fiscal partner', answer: 'Yes' }] }] },
  { id: 'SUB-2026-1037', clientId: 'c-106', clientName: 'Daan Meijer', clientEmail: 'daan.meijer@example.nl', filingType: 'Income tax + business', status: 'Accepted', progress: 100, submittedAt: '2026-07-14T16:05:00', updatedAt: '2026-07-14T16:05:00', answers: [{ section: 'Income', items: [{ question: 'Employment income', answer: 'Yes' }] }] },
]

export const payments: Payment[] = [
  { id: 'pay-1', submissionId: 'SUB-2026-1042', clientId: 'c-101', clientName: 'Sophie de Vries', clientEmail: 'sophie.devries@example.nl', amount: 149, status: 'Paid', date: '2026-07-21T10:31:00', reference: 'BIB-8K4M2' },
  { id: 'pay-2', submissionId: 'SUB-2026-1041', clientId: 'c-102', clientName: 'Noah Jansen', clientEmail: 'noah.jansen@example.nl', amount: 249, status: 'Pending', date: '2026-07-20T15:10:00', reference: 'BIB-2N7Q9' },
  { id: 'pay-3', submissionId: 'SUB-2026-1039', clientId: 'c-104', clientName: 'Liam Visser', clientEmail: 'liam.visser@example.nl', amount: 299, status: 'Paid', date: '2026-07-18T13:52:00', reference: 'BIB-5P1X6' },
  { id: 'pay-4', submissionId: 'SUB-2026-1038', clientId: 'c-105', clientName: 'Mila Bakker', clientEmail: 'mila.bakker@example.nl', amount: 149, status: 'Failed', date: '2026-07-16T11:36:00', reference: 'BIB-7R3D8' },
  { id: 'pay-5', submissionId: 'SUB-2026-1037', clientId: 'c-106', clientName: 'Daan Meijer', clientEmail: 'daan.meijer@example.nl', amount: 249, status: 'Paid', date: '2026-07-14T16:12:00', reference: 'BIB-9T6C1' },
]

export const documents: ClientDocument[] = [
  { id: 'doc-1', clientId: 'c-101', submissionId: 'SUB-2026-1042', owner: 'Sophie de Vries', name: 'Annual-statement-2025.pdf', type: 'PDF', size: '1.8 MB', uploadedAt: '2026-07-21T09:52:00', status: 'Available' },
  { id: 'doc-2', clientId: 'c-101', submissionId: 'SUB-2026-1042', owner: 'Sophie de Vries', name: 'Healthcare-costs.pdf', type: 'PDF', size: '820 KB', uploadedAt: '2026-07-21T09:54:00', status: 'Pending review' },
  { id: 'doc-3', clientId: 'c-102', submissionId: 'SUB-2026-1041', owner: 'Noah Jansen', name: 'Profit-loss-2025.xlsx', type: 'XLSX', size: '540 KB', uploadedAt: '2026-07-20T14:42:00', status: 'Available' },
  { id: 'doc-4', clientId: 'c-104', submissionId: 'SUB-2026-1039', owner: 'Liam Visser', name: 'Company-accounts.pdf', type: 'PDF', size: '3.2 MB', uploadedAt: '2026-07-18T12:11:00', status: 'Available' },
  { id: 'doc-5', clientId: 'c-105', submissionId: 'SUB-2026-1038', owner: 'Mila Bakker', name: 'Mortgage-statement.pdf', type: 'PDF', size: '1.1 MB', uploadedAt: '2026-07-16T10:50:00', status: 'Pending review' },
]
