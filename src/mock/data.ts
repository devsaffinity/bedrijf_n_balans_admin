import type { Client, ClientDocument, Payment, Submission } from '../types/domain'

export const clients: Client[] = [
  {
    id: 'c-101', name: 'Sophie de Vries', email: 'sophie.devries@example.nl', phone: '+31 6 1234 5678',
    dateOfBirth: '1992-08-14', nationality: 'Dutch', city: 'Amsterdam', bsn: '123456789', fiveDigitCode: '48291',
    maritalStatus: 'Single',
    hasThirtyPercentRuling: false,
    registrationDate: '2018-03-12', originCountry: 'Belgium', emigratedFromNetherlands: false,
    status: 'Active', filingType: 'Income tax', joinedAt: '2026-05-12',
  },
  {
    id: 'c-102', name: 'Noah Jansen', email: 'noah.jansen@example.nl', phone: '+31 6 2345 6789',
    dateOfBirth: '1988-11-03', nationality: 'Dutch', city: 'Utrecht', bsn: '987654321', fiveDigitCode: '73156',
    maritalStatus: 'Married', dateOfMarriage: '2019-06-15',
    hasThirtyPercentRuling: true, thirtyPercentRulingStart: '2020-01-01', thirtyPercentRulingEnd: '2025-12-31',
    registrationDate: '2017-09-01', originCountry: 'Germany', emigratedFromNetherlands: false,
    partner: {
      name: 'Lisa Jansen', email: 'lisa.jansen@example.nl', phone: '+31 6 2345 9999',
      dateOfBirth: '1990-04-22', nationality: 'German', city: 'Utrecht', bsn: '111222333', fiveDigitCode: '58201',
      registrationDate: '2019-07-01', originCountry: 'Germany', emigratedFromNetherlands: false,
    },
    status: 'Review needed', filingType: 'Income tax + business', joinedAt: '2026-05-18',
  },
  {
    id: 'c-103', name: 'Emma Smit', email: 'emma.smit@example.nl', phone: '+31 6 3456 7890',
    status: 'Awaiting submission', filingType: 'Income tax', joinedAt: '2026-06-02',
  },
  {
    id: 'c-104', name: 'Liam Visser', email: 'liam.visser@example.nl', phone: '+31 6 4567 8901',
    dateOfBirth: '1985-02-28', nationality: 'Dutch', city: 'Antwerp', bsn: '456789012', fiveDigitCode: '30472',
    maritalStatus: 'Divorced', dateOfMarriage: '2012-05-20',
    hasThirtyPercentRuling: true, thirtyPercentRulingStart: '2018-04-01', thirtyPercentRulingEnd: '2023-03-31',
    registrationDate: '2010-02-08', originCountry: 'United Kingdom', emigratedFromNetherlands: true, emigrationDate: '2025-08-31', destinationCountry: 'Belgium',
    status: 'Active', filingType: 'Business filing', joinedAt: '2026-06-11',
  },
  {
    id: 'c-105', name: 'Mila Bakker', email: 'mila.bakker@example.nl', phone: '+31 6 5678 9012',
    dateOfBirth: '1995-07-10', nationality: 'Dutch', city: 'Rotterdam', bsn: '789012345', fiveDigitCode: '61938',
    maritalStatus: 'Living together',
    hasThirtyPercentRuling: false,
    registrationDate: '2020-01-15', originCountry: 'France', emigratedFromNetherlands: false,
    partner: {
      name: 'Thomas Bakker', email: 'thomas.bakker@example.nl', phone: '+31 6 5678 4444',
      dateOfBirth: '1993-12-05', nationality: 'French', city: 'Rotterdam', bsn: '222333444', fiveDigitCode: '42017',
      registrationDate: '2020-02-01', originCountry: 'France', emigratedFromNetherlands: false,
    },
    status: 'Review needed', filingType: 'Income tax', joinedAt: '2026-06-24',
  },
  {
    id: 'c-106', name: 'Daan Meijer', email: 'daan.meijer@example.nl', phone: '+31 6 6789 0123',
    dateOfBirth: '1991-03-17', nationality: 'Dutch', city: 'The Hague', bsn: '345678901', fiveDigitCode: '85764',
    maritalStatus: 'Married', dateOfMarriage: '2021-04-23',
    hasThirtyPercentRuling: false,
    registrationDate: '2016-11-10', originCountry: 'Belgium', emigratedFromNetherlands: false,
    partner: {
      name: 'Sara Meijer', email: 'sara.meijer@example.nl', phone: '+31 6 6789 8888',
      dateOfBirth: '1994-09-30', nationality: 'Belgian', city: 'The Hague', bsn: '555666777', fiveDigitCode: '19384',
      registrationDate: '2021-05-01', originCountry: 'Belgium', emigratedFromNetherlands: false,
    },
    status: 'Active', filingType: 'Income tax + business', joinedAt: '2026-07-03',
  },
  {
    id: 'c-107', name: 'Julia Mulder', email: 'julia.mulder@example.nl', phone: '+31 6 7890 1234',
    status: 'Awaiting submission', filingType: 'Income tax', joinedAt: '2026-07-09',
  },
]

export const submissions: Submission[] = [
  { id: 'SUB-2026-1042', filingDetails: {"filingYear":2025,"mainPerson":{"name":"Sophie de Vries","email":"sophie.devries@example.nl","dateOfBirth":"1992-08-14","nationality":"Dutch","city":"Amsterdam","registrationDate":"2018-03-12","originCountry":"Belgium","emigratedFromNetherlands":false,"travel":{"usedPublicTransport":false}},"hasPartner":false,"children":{"hasChildren":false},"business":{"hasOwnBusiness":false},"accountsAndMortgage":{"accounts":[{"id":"account-101-1","name":"Everyday account","category":"Current bank account/saving account inside Netherlands","holder":"Me","balanceEur":2850},{"id":"account-101-2","name":"Savings account","category":"Current bank account/saving account inside Netherlands","holder":"Me","balanceEur":12500}],"hasForeignMortgage":false}}, propertyDetails: {"filingYear":2025,"housing":"Rental","ownsMultipleHousesInNetherlands":false,"situation":"I rented my home throughout the filing year.\nI did not own any property in the Netherlands."}, clientId: 'c-101', clientName: 'Sophie de Vries', clientEmail: 'sophie.devries@example.nl', filingType: 'Income tax', status: 'Pending', progress: 100, submittedAt: '2026-07-21T10:24:00', updatedAt: '2026-07-21T10:24:00', answers: [
    { section: 'Personal details', items: [{ question: 'Tax year', answer: '2025' }, { question: 'Fiscal partner', answer: 'No' }, { question: 'Country of residence', answer: 'Netherlands' }] },
    { section: 'Income', items: [{ question: 'Employment income', answer: 'Yes' }, { question: 'Multiple employers', answer: 'No' }, { question: 'Other income', answer: 'None reported' }] },
    { section: 'Deductions', items: [{ question: 'Deductible healthcare costs', answer: 'Yes — supporting document uploaded' }, { question: 'Charitable donations', answer: 'No' }] },
  ] },
  { id: 'SUB-2026-1041', filingDetails: {"filingYear":2025,"mainPerson":{"name":"Noah Jansen","email":"noah.jansen@example.nl","dateOfBirth":"1988-11-03","nationality":"Dutch","city":"Utrecht","registrationDate":"2017-09-01","originCountry":"Germany","emigratedFromNetherlands":false,"travel":{"usedPublicTransport":true,"followUp":{"label":"Travel follow-up response","answer":false},"details":[{"label":"Commuting route","value":"Utrecht ? Amsterdam"},{"label":"Public transport statement","value":"To be provided"}]}},"hasPartner":true,"partner":{"name":"Lisa Jansen","email":"lisa.jansen@example.nl","dateOfBirth":"1990-04-22","nationality":"German","city":"Utrecht","registrationDate":"2019-07-01","originCountry":"Germany","emigratedFromNetherlands":false,"travel":{"usedPublicTransport":true,"followUp":{"label":"Travel follow-up response","answer":true},"details":[{"label":"Commuting route","value":"Utrecht ? Rotterdam"},{"label":"Public transport statement","value":"To be provided"}]}},"children":{"hasChildren":true,"details":[{"label":"Number of children","value":"2"}]},"business":{"hasOwnBusiness":true,"ownership":"Me","details":[{"label":"Business name","value":"Jansen Consulting"},{"label":"Business structure","value":"Sole proprietorship"}]},"accountsAndMortgage":{"accounts":[{"id":"account-102-1","name":"Household account","category":"Current bank account/saving account inside Netherlands","holder":"Joint","balanceEur":6400},{"id":"account-102-2","name":"Savings outside Netherlands","category":"Bank savings account outside NL","holder":"Me","balanceEur":18500}],"hasForeignMortgage":true,"foreignMortgageAmountEur":135000}}, propertyDetails: {"filingYear":2025,"housing":"Purchased with mortgage","mortgageDetails":[{"question":"Mortgage annual statement","answer":"To be provided"}],"ownsMultipleHousesInNetherlands":true,"additionalHouseDetails":[{"question":"Property locations","answer":"Utrecht and Amsterdam"}],"rentedOut":false,"situation":"We moved to Utrecht during the filing year. Our former home in Amsterdam was still for sale.\nNeither property was rented out."}, clientId: 'c-102', clientName: 'Noah Jansen', clientEmail: 'noah.jansen@example.nl', filingType: 'Income tax + business', status: 'Accepted', progress: 100, submittedAt: '2026-07-20T15:08:00', updatedAt: '2026-07-20T15:08:00', answers: [{ section: 'Business details', items: [{ question: 'Business structure', answer: 'Sole proprietorship' }, { question: 'VAT registered', answer: 'Yes' }] }] },
  { id: 'SUB-2026-1040', clientId: 'c-103', clientName: 'Emma Smit', clientEmail: 'emma.smit@example.nl', filingType: 'Income tax', status: 'Pending', progress: 64, submittedAt: null, updatedAt: '2026-07-20T09:12:00', answers: [{ section: 'Personal details', items: [{ question: 'Tax year', answer: '2025' }] }] },
  { id: 'SUB-2026-1039', filingDetails: {"filingYear":2025,"mainPerson":{"name":"Liam Visser","email":"liam.visser@example.nl","dateOfBirth":"1985-02-28","nationality":"Dutch","city":"Antwerp","registrationDate":"2010-02-08","originCountry":"United Kingdom","emigratedFromNetherlands":true,"emigrationDate":"2025-08-31","destinationCountry":"Belgium","travel":{"usedPublicTransport":true,"followUp":{"label":"Travel follow-up response","answer":false},"details":[{"label":"Commuting route","value":"Amsterdam ? Rotterdam"},{"label":"Public transport statement","value":"To be provided"}]}},"hasPartner":false,"children":{"hasChildren":false},"business":{"hasOwnBusiness":true,"ownership":"Me","details":[{"label":"Business name","value":"Visser Services"},{"label":"Business structure","value":"Private limited company"}]},"accountsAndMortgage":{"accounts":[{"id":"account-104-1","name":"Current account","category":"Current bank account/saving account inside Netherlands","holder":"Me","balanceEur":4300}],"hasForeignMortgage":true,"foreignMortgageAmountEur":185000}}, propertyDetails: {"filingYear":2025,"housing":"Purchased with mortgage","mortgageDetails":[{"question":"Mortgage annual statement","answer":"To be provided"}],"ownsMultipleHousesInNetherlands":true,"additionalHouseDetails":[{"question":"Property locations","answer":"Amsterdam and Rotterdam"}],"rentedOut":true,"rentalDetails":[{"question":"Rental period","answer":"1 January to 31 December 2025"},{"question":"Rental income","answer":"EUR 14,400"}],"situation":"I own two properties in the Netherlands and rented out the Rotterdam property during the filing year.\nI moved to Belgium in August."}, clientId: 'c-104', clientName: 'Liam Visser', clientEmail: 'liam.visser@example.nl', filingType: 'Business filing', status: 'Pending', progress: 100, submittedAt: '2026-07-18T13:45:00', updatedAt: '2026-07-18T13:45:00', answers: [{ section: 'Business details', items: [{ question: 'Business structure', answer: 'Private limited company' }] }] },
  { id: 'SUB-2026-1038', filingDetails: {"filingYear":2025,"mainPerson":{"name":"Mila Bakker","email":"mila.bakker@example.nl","dateOfBirth":"1995-07-10","nationality":"Dutch","city":"Rotterdam","registrationDate":"2020-01-15","originCountry":"France","emigratedFromNetherlands":false,"travel":{"usedPublicTransport":false}},"hasPartner":true,"partner":{"name":"Thomas Bakker","email":"thomas.bakker@example.nl","dateOfBirth":"1993-12-05","nationality":"French","city":"Rotterdam","registrationDate":"2020-02-01","originCountry":"France","emigratedFromNetherlands":false,"travel":{"usedPublicTransport":true,"followUp":{"label":"Travel follow-up response","answer":false},"details":[{"label":"Commuting route","value":"Rotterdam ? The Hague"},{"label":"Public transport statement","value":"To be provided"}]}},"children":{"hasChildren":true,"details":[{"label":"Number of children","value":"1"}]},"business":{"hasOwnBusiness":true,"ownership":"My partner","details":[{"label":"Business name","value":"Thomas Design"},{"label":"Business structure","value":"ZZP / Freelancer"}]},"accountsAndMortgage":{"accounts":[{"id":"account-105-1","name":"Joint account","category":"Current bank account/saving account inside Netherlands","holder":"Joint","balanceEur":5200},{"id":"account-105-2","name":"Partner savings","category":"Current bank account/saving account inside Netherlands","holder":"My partner","balanceEur":21000}],"hasForeignMortgage":false}}, propertyDetails: {"filingYear":2025,"housing":"Purchased with mortgage","mortgageDetails":[{"question":"Mortgage annual statement","answer":"Mortgage-statement.pdf"}],"ownsMultipleHousesInNetherlands":false,"situation":"My partner and I purchased our home in Rotterdam. The mortgage statement is included with the filing documents."}, clientId: 'c-105', clientName: 'Mila Bakker', clientEmail: 'mila.bakker@example.nl', filingType: 'Income tax', status: 'Rejected', progress: 100, submittedAt: '2026-07-16T11:30:00', updatedAt: '2026-07-22T08:20:00', answers: [{ section: 'Personal details', items: [{ question: 'Tax year', answer: '2025' }, { question: 'Fiscal partner', answer: 'Yes' }] }] },
  { id: 'SUB-2026-1037', filingDetails: {"filingYear":2024,"mainPerson":{"name":"Daan Meijer","email":"daan.meijer@example.nl","dateOfBirth":"1991-03-17","nationality":"Dutch","city":"The Hague","registrationDate":"2016-11-10","originCountry":"Belgium","emigratedFromNetherlands":false,"travel":{"usedPublicTransport":true,"followUp":{"label":"Travel follow-up response","answer":true},"details":[{"label":"Commuting route","value":"The Hague ? Amsterdam"},{"label":"Public transport statement","value":"To be provided"}]}},"hasPartner":true,"partner":{"name":"Sara Meijer","email":"sara.meijer@example.nl","dateOfBirth":"1994-09-30","nationality":"Belgian","city":"The Hague","registrationDate":"2021-05-01","originCountry":"Belgium","emigratedFromNetherlands":false,"travel":{"usedPublicTransport":false}},"children":{"hasChildren":false},"business":{"hasOwnBusiness":true,"ownership":"Jointly (VOF)","details":[{"label":"Business name","value":"Meijer Studio VOF"},{"label":"Business structure","value":"VOF"}]},"accountsAndMortgage":{"accounts":[],"hasForeignMortgage":false}}, clientId: 'c-106', clientName: 'Daan Meijer', clientEmail: 'daan.meijer@example.nl', filingType: 'Income tax + business', status: 'Accepted', progress: 100, submittedAt: '2026-07-14T16:05:00', updatedAt: '2026-07-14T16:05:00', answers: [{ section: 'Income', items: [{ question: 'Employment income', answer: 'Yes' }] }] },
  {"id":"SUB-2026-1036","clientId":"c-102","clientName":"Noah Jansen","clientEmail":"noah.jansen@example.nl","filingType":"Mixed Regular + M-Form","status":"Accepted","progress":100,"submittedAt":"2026-07-10T12:00:00","updatedAt":"2026-07-10T12:00:00","answers":[{"section":"Personal details","items":[{"question":"Tax year","answer":"2024"}]}],"filingDetails":{"filingYear":2024,"mainPerson":{"name":"Noah Jansen","email":"noah.jansen@example.nl","dateOfBirth":"1988-11-03","nationality":"Dutch","city":"Utrecht","registrationDate":"2017-09-01","originCountry":"Germany","emigratedFromNetherlands":false,"travel":{"usedPublicTransport":true,"followUp":{"label":"Travel follow-up response","answer":false},"details":[{"label":"Commuting route","value":"Utrecht ? Amsterdam"},{"label":"Public transport statement","value":"To be provided"}]}},"hasPartner":true,"partner":{"name":"Lisa Jansen","email":"lisa.jansen@example.nl","dateOfBirth":"1990-04-22","nationality":"German","city":"Utrecht","registrationDate":"2024-04-01","originCountry":"Germany","emigratedFromNetherlands":false,"travel":{"usedPublicTransport":true,"followUp":{"label":"Travel follow-up response","answer":true},"details":[{"label":"Commuting route","value":"Utrecht ? Rotterdam"},{"label":"Public transport statement","value":"To be provided"}]}},"children":{"hasChildren":true,"details":[{"label":"Number of children","value":"2"}]},"business":{"hasOwnBusiness":false},"accountsAndMortgage":{"accounts":[{"id":"account-102-2024-1","name":"Current account","category":"Current bank account/saving account inside Netherlands","holder":"Me","balanceEur":4600},{"id":"account-102-2024-2","name":"Partner savings","category":"Current bank account/saving account inside Netherlands","holder":"My partner","balanceEur":9500}],"hasForeignMortgage":true,"foreignMortgageAmountEur":142000}},"propertyDetails":{"filingYear":2024,"housing":"Rental","ownsMultipleHousesInNetherlands":false,"situation":"My partner registered in the Netherlands in April of this filing year."}},
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
