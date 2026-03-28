# 🎯 Opportunity Discovery Platform

## 1. Concept

This project solves the problem of **unstructured opportunity discovery** in the entertainment industry.

Casting calls, workshops, and collaboration opportunities are scattered across WhatsApp groups, Instagram posts, and personal networks, making them hard to track and act upon.

This platform ingests such unstructured data, processes it using AI, and presents a **clean, structured, and searchable feed of opportunities** for artists.

---

## 2. Building Blocks

1. **Ingestion Layer** – Receive messages via Telegram bot webhook  
2. **Preprocessing Layer** – Clean text and extract phones/links  
3. **Deduplication Layer** – Remove repeated or similar messages  
4. **LLM Extraction Layer** – Convert text into structured JSON  
5. **Auto-Fix Layer** – Repair common LLM output issues  
6. **Validation Layer (Loose)** – Ensure minimum usable structure  
7. **Normalization Layer** – Convert data into unified schema  
8. **Database Layer** – Store raw + structured opportunities  
9. **API Layer** – Serve feed data via endpoints  
10. **Frontend Layer** – Display opportunity feed  
11. **Fallback Handling** – Show raw message if parsing fails  
12. **Basic Filtering** – Filter by category/location  

---

## 3. Tech Stack

### Frontend
- Next.js  
- TypeScript  
- Tailwind CSS  

### Backend
- Node.js (Express / Fastify)  
- REST APIs  

### AI Layer
- OpenAI API (e.g., `gpt-4o-mini`)  

### Database
- MongoDB Atlas  

### Ingestion
- Telegram Bot (Webhook-based)  

### Hosting
- Vercel (Frontend)  
- Render / Railway (Backend)  

---

## 4. Cost (MVP Estimate)

| Component                     | Cost                  |
|-----------------------------|-----------------------|
| Hosting (Backend + Frontend)| ₹0 – ₹1500/month      |
| Database (MongoDB Atlas)    | Free (MVP tier)       |
| Telegram Bot                | Free                  |
| LLM API (OpenAI)            | ₹1000 – ₹3000/month   |

**Total Estimated Cost:** ₹1k – ₹5k/month

---

## 5. MVP Features

- Ingest casting messages via Telegram bot  
- AI-based structured extraction  
- Deduplication of repeated opportunities  
- Category classification (casting, workshop, etc.)  
- Clean opportunity feed UI  
- Basic filtering (category/location)  
- Fallback for unstructured/failed parsing  
- Store raw + structured data  

---

## 🚀 Future Enhancements

- Trust scoring & verification system  
- Personalized feed (based on actor profile)  
- Notifications for relevant opportunities  
- Instagram ingestion  
- WhatsApp Business API integration  
- Actor profiles & application flow  

---

## 🧠 Core Idea

> Transform noisy, unstructured chat data into a reliable, structured opportunity feed for artists.
