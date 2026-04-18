import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './constants';

export type ParsedTransaction = {
  type: 'income' | 'expense' | 'debt' | 'reminder';
  amount: number;
  category: string;
  description: string;
  personName?: string;
  date?: string;
  originalAmount?: number;
  originalCurrency?: string;
};

const DICTIONARY = {
  es: {
    income: ['ingrese', 'gano', 'recibi', 'cobre', 'me pagaron', 'me dieron', 'tengo', 'ingreso', 'entrada', 'entro', 'ingresaron', 'me entro', 'me ingresaron', 'sueldo', 'pago'],
    expense: ['gaste', 'pague', 'gasto', 'compre', 'pago', 'merqué', 'salida', 'consumo'],
    debt: ['deben', 'prest', 'deuda', 'debo', 'me debe', 'prestamo'],
    reminder: ['recordar', 'aviso', 'avisame', 'acordar', 'haceme acordar', 'evento'],
    categories: {
      food: ['comida', 'carne', 'super', 'queso', 'pan', 'leche', 'verdura', 'fruta', 'almuerzo', 'cena', 'restaurante', 'factura', 'galle', 'bebida', 'mc donalds', 'burger'],
      transport: ['nafta', 'combustible', 'uber', 'taxi', 'sube', 'bondi', 'colectivo', 'viaje', 'auto', 'mecanico', 'estacionamiento'],
      services: ['luz', 'agua', 'gas', 'internet', 'fibertel', 'personal', 'movistar', 'claro', 'gym', 'gimnasio', 'expensas', 'seguro', 'alquiler'],
      tech: ['celular', 'computadora', 'notebook', 'teclado', 'monitor', 'mouse', 'gadget', 'software', 'pc', 'iphone', 'android', 'tecnologia'],
      clothing: ['ropa', 'zapatillas', 'jean', 'remera', 'camisa', 'campera', 'pantalon', 'abrigo', 'calzado', 'moda'],
      entertainment: ['cine', 'salida', 'netflix', 'spotify', 'juego', 'gaming', 'steam', 'playstation', 'teatro', 'recital', 'concierto', 'ps4', 'ps5', 'xbox', 'disney', 'hbo'],
      health: ['farmacia', 'remedio', 'medico', 'clinica', 'dentista', 'obra social', 'hospital'],
      education: ['curso', 'universidad', 'escuela', 'colegio', 'libros', 'utiles'],
      home: ['muebles', 'decoracion', 'ferreteria', 'pintura'],
      salary: ['sueldo', 'cobro', 'aguinaldo', 'nomina'],
      freelance: ['proyecto', 'cliente', 'web', 'freelance', 'trabajo']
    }
  },
  en: {
    income: ['earned', 'received', 'got', 'income', 'salary', 'plus', 'deposit', 'bonus', 'paycheck'],
    expense: ['spent', 'paid', 'bought', 'expense', 'purchase', 'bill', 'cost', 'payed'],
    debt: ['owes', 'debt', 'borrowed', 'lend', 'owe me'],
    reminder: ['remind', 'alert', 'notice', 'remember', 'event'],
    categories: {
      food: ['food', 'meat', 'grocery', 'cheese', 'bread', 'milk', 'veggies', 'fruit', 'lunch', 'dinner', 'restaurant', 'burger', 'mcdonalds', 'pizza', 'sushi'],
      transport: ['gas', 'fuel', 'uber', 'taxi', 'bus', 'train', 'parking', 'trip', 'car', 'mechanic'],
      services: ['electricity', 'water', 'internet', 'subscription', 'gym', 'rent', 'insurance', 'phone bill'],
      tech: ['phone', 'computer', 'laptop', 'keyboard', 'monitor', 'mouse', 'gadget', 'software', 'pc', 'iphone', 'android', 'tech'],
      clothing: ['clothing', 'clothes', 'shoes', 'sneakers', 'jeans', 'shirt', 't-shirt', 'jacket', 'pants', 'coat', 'fashion'],
      entertainment: ['cinema', 'movie', 'netflix', 'spotify', 'game', 'gaming', 'steam', 'playstation', 'theatre', 'concert', 'xbox', 'disney', 'hbo'],
      health: ['pharmacy', 'medicine', 'doctor', 'clinic', 'dentist', 'health insurance', 'hospital'],
      education: ['course', 'university', 'school', 'college', 'books', 'supplies'],
      home: ['furniture', 'decor', 'hardware', 'paint', 'homeware'],
      salary: ['salary', 'wage', 'payday', 'payroll'],
      freelance: ['project', 'client', 'web', 'freelance', 'work']
    }
  },
  pt: {
    income: ['ganhei', 'recebi', 'renda', 'entrada', 'salario', 'pagamento'],
    expense: ['gastei', 'paguei', 'comprei', 'despesa', 'compra', 'custo'],
    debt: ['deve', 'divida', 'emprestado', 'me deve'],
    reminder: ['lembrar', 'aviso', 'avisar', 'lembrete'],
    categories: {
      food: ['comida', 'carne', 'super', 'queijo', 'pao', 'leite', 'verdura', 'fruta', 'almoco', 'jantar', 'restaurante', 'lanche'],
      transport: ['gasolina', 'combustivel', 'uber', 'taxi', 'onibus', 'trem', 'estacionamento', 'viagem', 'carro', 'mecanico'],
      services: ['luz', 'agua', 'gas', 'internet', 'academia', 'aluguel', 'seguro', 'celular'],
      tech: ['celular', 'computador', 'notebook', 'teclado', 'monitor', 'mouse', 'software', 'pc', 'iphone', 'android', 'tecnologia'],
      clothing: ['roupas', 'tenis', 'jeans', 'camiseta', 'camisa', 'jaqueta', 'calca', 'sapato', 'moda'],
      entertainment: ['cinema', 'filme', 'netflix', 'spotify', 'jogo', 'gaming', 'steam', 'playstation', 'teatro', 'show', 'xbox', 'disney'],
      health: ['farmacia', 'remedio', 'medico', 'clinica', 'dentista', 'plano de saude', 'hospital'],
      education: ['curso', 'universidade', 'escola', 'colegio', 'livros'],
      home: ['moveis', 'decoracao', 'ferramentas', 'pintura'],
      salary: ['salario', 'pagamento', 'contracheque'],
      freelance: ['projeto', 'cliente', 'web', 'freelance', 'trabalho']
    }
  },
  it: {
    income: ['guadagnato', 'ricevuto', 'entrata', 'reddito', 'stipendio', 'pagamento'],
    expense: ['speso', 'pagato', 'comprato', 'spesa', 'acquisto', 'costo'],
    debt: ['deve', 'debito', 'prestato', 'mi deve'],
    reminder: ['ricordami', 'avviso', 'promemoria', 'ricordare'],
    categories: {
      food: ['cibo', 'carne', 'supermercato', 'formaggio', 'pane', 'latte', 'verdura', 'frutta', 'pranzo', 'cena', 'ristorante'],
      transport: ['benzina', 'carburante', 'uber', 'taxi', 'autobus', 'treno', 'parcheggio', 'viaggio', 'auto', 'meccanico'],
      services: ['luce', 'acqua', 'gas', 'internet', 'palestra', 'affitto', 'assicurazione', 'bolletta'],
      tech: ['cellulare', 'computer', 'notebook', 'tastiera', 'monitore', 'mouse', 'software', 'pc', 'iphone', 'android'],
      clothing: ['vestiti', 'scarpe', 'jeans', 'maglietta', 'camicia', 'giacca', 'pantaloni', 'moda'],
      entertainment: ['cinema', 'film', 'netflix', 'spotify', 'gioco', 'gaming', 'steam', 'playstation', 'teatro', 'concerto'],
      health: ['farmacia', 'medicina', 'medico', 'clinica', 'dentista', 'assicurazione sanitaria', 'ospedale'],
      education: ['corso', 'universita', 'scuola', 'collegio', 'libri'],
      home: ['mobili', 'decorazioni', 'ferramenta', 'vernice'],
      salary: ['stipendio', 'paga', 'busta paga'],
      freelance: ['progetto', 'cliente', 'web', 'freelance', 'lavoro']
    }
  },
  fr: {
    income: ['gagne', 'recu', 'revenu', 'entree', 'salaire', 'paiement'],
    expense: ['depense', 'paye', 'achete', 'depense', 'achat', 'cout'],
    debt: ['doit', 'dette', 'prete', 'me doit'],
    reminder: ['rappel', 'rappeler', 'avertir', 'avis'],
    categories: {
      food: ['nourriture', 'viande', 'supermarche', 'fromage', 'pain', 'lait', 'legumes', 'fruits', 'dejeuner', 'diner', 'restaurant'],
      transport: ['essence', 'carburant', 'uber', 'taxi', 'bus', 'train', 'parking', 'voyage', 'voiture', 'mecanicien'],
      services: ['electricite', 'eau', 'internet', 'gym', 'loyer', 'assurance', 'facture'],
      tech: ['telephone', 'ordinateur', 'ordinateur portable', 'clavier', 'moniteur', 'souris', 'logiciel', 'pc', 'iphone', 'android'],
      clothing: ['vetements', 'chaussures', 'jeans', 't-shirt', 'chemise', 'veste', 'pantalon', 'mode'],
      entertainment: ['cinema', 'film', 'netflix', 'spotify', 'jeu', 'gaming', 'steam', 'playstation', 'theatre', 'concert'],
      health: ['pharmacie', 'medicament', 'medecin', 'clinique', 'dentiste', 'assurance maladie', 'hopital'],
      education: ['cours', 'universite', 'ecole', 'college', 'livres'],
      home: ['meubles', 'decoration', 'quincaillerie', 'peinture'],
      salary: ['salaire', 'paie', 'bulletin de paie'],
      freelance: ['projet', 'client', 'web', 'freelance', 'travail']
    }
  }
};

const CURRENCY_SYMBOLS = {
  USD: ['usd', 'dolares', 'dollars', 'u$d', '$'],
  EUR: ['eur', 'euros', '€'],
  BRL: ['brl', 'reais', 'reales', 'r$'],
  ARS: ['ars', 'pesos', 'arg']
};

export function parseNaturalLanguage(
  input: string, 
  lang: string = 'es', 
  targetCurrency: string = 'ARS',
  rates?: Record<string, number>
): ParsedTransaction | null {
  const text = input.toLowerCase();
  const dict = DICTIONARY[lang as keyof typeof DICTIONARY] || DICTIONARY.es;

  // 1. Detect Currency and Amount
  let amount = 0;
  let detectedCurrency = targetCurrency;
  
  // Regex to find numbers
  const numRegex = /(\d+([.,]\d{3})*([.,]\d+)?)/;
  const numMatch = text.match(numRegex);
  
  if (numMatch) {
    let rawAmount = numMatch[1].replace(/\./g, '').replace(',', '.');
    amount = parseFloat(rawAmount);

    // Detect if another currency was mentioned
    for (const [currency, symbols] of Object.entries(CURRENCY_SYMBOLS)) {
      if (symbols.some(s => text.includes(s))) {
        detectedCurrency = currency;
        break;
      }
    }

    // ALWAYS convert to ARS for database storage
    if (rates && detectedCurrency !== 'ARS') {
      const rateToUSD = 1 / rates[detectedCurrency];
      const usdAmount = amount * rateToUSD;
      amount = usdAmount * rates['ARS'];
    }
  }

  // 2. Detect Type
  let type: 'income' | 'expense' | 'debt' | 'reminder' = 'expense';
  if (dict.income.some(k => text.includes(k))) type = 'income';
  else if (dict.debt.some(k => text.includes(k))) type = 'debt';
  else if (dict.reminder.some(k => text.includes(k))) type = 'reminder';
  else if (dict.expense.some(k => text.includes(k))) type = 'expense';

  // 3. Detect Category
  let category = 'other';
  for (const [catId, keywords] of Object.entries(dict.categories)) {
    if (keywords.some(k => text.includes(k))) {
      category = catId;
      break;
    }
  }

  // 4. Person Name for Debts
  let personName = '';
  if (type === 'debt') {
    const personMatch = text.match(/(?:de|a|me deve|owes|doit|doit à|mi deve)\s+([a-zñáéíóú]+)(?:\s|$)/i);
    if (personMatch) personName = personMatch[1].charAt(0).toUpperCase() + personMatch[1].slice(1);
    else personName = lang === 'es' ? 'Alguien' : lang === 'en' ? 'Someone' : '...';
  }

  // 5. Build Description
  let foundDesc = input.replace(/\d+([.,]\d+)?/g, '').trim();
  // Remove currency symbols/names from description
  Object.values(CURRENCY_SYMBOLS).flat().forEach(s => {
    foundDesc = foundDesc.replace(new RegExp(`\\b${s}\\b`, 'gi'), '');
  });
  
  foundDesc = foundDesc.replace(/^[^\w\s]+|[^\w\s]+$/g, '').trim();
  foundDesc = foundDesc.charAt(0).toUpperCase() + foundDesc.slice(1);

  return {
    type,
    amount,
    category,
    description: foundDesc || (type === 'expense' ? 'Quick Expense' : 'Quick Register'),
    personName,
    date: new Date().toISOString().split('T')[0],
    originalAmount: amount, // Keeping these for reference if needed
    originalCurrency: detectedCurrency
  };
}
