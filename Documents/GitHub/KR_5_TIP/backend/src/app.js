const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Загружаем переменные окружения
dotenv.config();

// Создаем Express приложение
const app = express();

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Кастомный middleware для логирования
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  if (Object.keys(req.query).length > 0) {
    console.log("📋 Query параметры:", req.query);
  }
  
  if (req.method === "POST" && req.body) {
    console.log("📦 Body:", req.body);
  }
  
  next();
});

// ========== МОК ДАННЫЕ ==========
const exchangeRates = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5,
  CAD: 1.37, AUD: 1.55, CHF: 0.88, CNY: 7.30,
  RUB: 93.5, TRY: 32.5
};

const currencyInfo = {
  USD: { name: "US Dollar", symbol: "$", country: "United States" },
  EUR: { name: "Euro", symbol: "€", country: "European Union" },
  GBP: { name: "British Pound", symbol: "£", country: "United Kingdom" },
  JPY: { name: "Japanese Yen", symbol: "¥", country: "Japan" },
  CAD: { name: "Canadian Dollar", symbol: "C$", country: "Canada" },
  AUD: { name: "Australian Dollar", symbol: "A$", country: "Australia" },
  CHF: { name: "Swiss Franc", symbol: "Fr", country: "Switzerland" },
  CNY: { name: "Chinese Yuan", symbol: "¥", country: "China" },
  RUB: { name: "Russian Ruble", symbol: "₽", country: "Russia" },
  TRY: { name: "Turkish Lira", symbol: "₺", country: "Turkey" }
};

// ========== API МАРШРУТЫ ==========

// Конвертация валюты
app.get("/api/currency/convert", (req, res) => {
  try {
    const { from, to, amount = 1 } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ 
        success: false,
        error: "Необходимо указать from и to валюты" 
      });
    }
    
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();
    
    if (!exchangeRates[fromUpper] || !exchangeRates[toUpper]) {
      return res.status(400).json({ 
        success: false,
        error: "Некорректный код валюты" 
      });
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ 
        success: false,
        error: "Сумма должна быть положительным числом" 
      });
    }
    
    const rate = exchangeRates[toUpper] / exchangeRates[fromUpper];
    const result = amountNum * rate;
    
    res.json({
      success: true,
      conversion: {
        from: fromUpper,
        to: toUpper,
        amount: amountNum,
        rate: parseFloat(rate.toFixed(6)),
        result: parseFloat(result.toFixed(2))
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Ошибка конвертации" 
    });
  }
});

// Курсы валют
app.get("/api/currency/rates", (req, res) => {
  try {
    const { base = "USD" } = req.query;
    const baseUpper = base.toUpperCase();
    
    if (!exchangeRates[baseUpper]) {
      return res.status(400).json({ 
        success: false,
        error: "Некорректная базовая валюта" 
      });
    }
    
    const rates = {};
    const baseRate = exchangeRates[baseUpper];
    
    Object.keys(exchangeRates).forEach(currency => {
      rates[currency] = parseFloat((exchangeRates[currency] / baseRate).toFixed(6));
    });
    
    res.json({
      success: true,
      base: baseUpper,
      rates,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Ошибка получения курсов" 
    });
  }
});

// Список валют
app.get("/api/currency/list", (req, res) => {
  try {
    const currencies = Object.keys(exchangeRates).map(code => ({
      code,
      name: currencyInfo[code]?.name || code,
      symbol: currencyInfo[code]?.symbol || code,
      country: currencyInfo[code]?.country || "N/A"
    }));
    
    res.json({
      success: true,
      currencies,
      count: currencies.length
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Ошибка получения списка валют" 
    });
  }
});

// Информация о валюте
app.get("/api/currency/:code", (req, res) => {
  try {
    const { code } = req.params;
    const upperCode = code.toUpperCase();
    
    if (!exchangeRates[upperCode]) {
      return res.status(404).json({ 
        success: false,
        error: `Валюта ${upperCode} не найдена` 
      });
    }
    
    const info = currencyInfo[upperCode] || {
      name: upperCode,
      symbol: upperCode,
      country: "N/A"
    };
    
    res.json({
      success: true,
      currency: {
        code: upperCode,
        ...info,
        exchangeRate: exchangeRates[upperCode]
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Ошибка получения информации о валюте" 
    });
  }
});

// Главная страница API
app.get("/", (req, res) => {
  res.json({
    message: "Currency Converter API - Контрольная работа №4",
    version: "1.0.0",
    author: "Студент",
    endpoints: {
      convert: "GET /api/currency/convert?from=USD&to=EUR&amount=100",
      rates: "GET /api/currency/rates?base=USD",
      list: "GET /api/currency/list",
      currencyInfo: "GET /api/currency/USD"
    }
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: "Маршрут не найден" 
  });
});

// Обработка ошибок сервера
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: "Внутренняя ошибка сервера" 
  });
});

// Экспортируем app для Vercel
module.exports = app;

// Запуск для локальной разработки
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
  });
}
