# Scope Search 📧🔭👁️

> Kunal Srivastava, Ayaan Rahim, Connor Chan, Andrew Shen
---

## Inspiration 🌟
> Email search sucks... A lot...

We've all had negative experiences with email. To be specific, **it's quite hard to find specific emails**. Email search is a cross-platform pain point, regardless of mobile or web: the core problem stems from the fact that most email search systems are reactive, simplistic, and keyword-based. They rely on older indexing and retrieval methods rather than understanding the true intent behind a query.

To figure out what we could do to make some progress, we talked to over 50 hackers this weekend before we got to building.

We learned users typically don’t remember exact email keywords but instead rely on contextual clues—like who the email was from, the approximate date, or a related attachment. Most email clients force users to manually filter by these parameters, which introduces friction.

We hypothesized that creating a retrieval system that had semantic understanding would likely provide a much better UX. Additionally, we could use a language model to provide responses to queries in natural language. 

What if your inbox could understand everyday language? You could ask, "When’s my next meeting?" or "Show me the latest sales report," and get the right answer right away. Our idea turns email search into a happier, easier experience. With embeddings, vector databases, and language models, we’re not just making search better — we’re changing how people deal with emails, helping them **save time and work more efficiently.**

## What it does 🕵️📧⁉️
Scope streamlines email search by making it fast and intuitive. After logging in, Scope retrieves, preprocesses, and cleans your emails. It then embeds these emails as high-dimensional vectors in ChromaDB, a vector database designed for efficient semantic search.

When you input a natural language query, Scope processes it using a language model to understand intent rather than just keywords. It semantically searches the vector database and returns the most relevant emails alongside a concise, natural language response using Groq's super-speed inference times. We even multi-modally embed images contained in emails for a heightened understanding. Whether you're looking for a specific message or general information, Scope provides quick, accurate results—without the manual filtering. 

Engage with your email like you would with a human. *It just makes more sense*.

## How we built it 💻💖

We built Scope using Electron to support both cross-platform desktop apps and a website, ensuring accessibility across devices. The frontend is crafted with JavaScript, Electron, React, and designed in Figma for a clean, intuitive UI. For the backend, we chose Python, Flask, and Groq. Groq provides a ~40x speed improvement in inference over OpenAI, allowing for faster query processing. We used ChromaDB for its built-in, customizable embeddings and efficient vector search, enabling us to handle semantic queries seamlessly. Our v0 started with 100 synthetically generated emails, and the final product includes Google login integration, allowing users to sign in with their Gmail and search their inbox with natural language.

## Challenges we ran into 🏔️🧗

One of the key challenges we faced was figuring out the best way to preprocess emails. Emails are complex, often containing HTML, tags, images, and various types of data. We needed a way to extract relevant content without pulling in unnecessary noise. Additionally, since emails come in many different formats, we required a flexible, non-discriminative preprocessing approach that could handle any structure effectively.

Integrating with Google was another hurdle, especially since it was our first time using Google Cloud Platform. We had to dive deep into understanding access tokens and credentials to obtain READ privileges for emails. This also involved building communication routes between the frontend and backend to allow users to log in with their Gmail accounts and stay logged in seamlessly. Additionally, the GMail API rate-limits us, forcing us to only index 500 emails at a time

Lastly, choosing the most effective embedding model was quite challenging. We experimented with several, including sentence transformers, word transformers, multimodal models, and models from OpenAI and Hugging Face. Through rigorous testing and quantitative evaluation, we were able to identify the most effective model for our needs, ensuring accurate and efficient email search results.


## ⭐Accomplishments⭐ that we're proud of

- **FAST email search and LLM inference**: We achieved rapid email retrieval by optimizing our embedding model and leveraging Groq's 40x faster inference, significantly improving response times over traditional methods.

- **Built-in integration with Gmail**: Implementing seamless Google login with full email READ access was a major win, allowing users to authenticate easily and use Scope with their Gmail accounts to search emails without friction.

- **Customizing ChromaDB setup**: We tailored ChromaDB to fit our specific use case, optimizing its embeddings and vector search for fast and accurate semantic query results, ensuring our users get relevant email matches.

- **Clean, intuitive, beautiful user interface**: Our frontend design is sleek and user-friendly, thanks to careful collaboration between Figma and React, making Scope feel simple yet powerful for all users.

- **Turning user research into a working product in under 40 hours**: Through rapid iteration and focusing on user pain points, we were able to transform our insights into a fully functional solution, bringing real impact in a short time frame.

- **Scoping hard and finishing v0 early**: By setting clear, realistic goals, we delivered our v0 ahead of schedule, which gave us valuable extra time to refine and improve the product before final submission.

## What we learned 📝🎓

- Working with new technologies like Groq, ChromaDB, and Google API taught us how to integrate cutting-edge tools and optimize them for our specific needs, significantly enhancing our product's performance.
  
- User research is crucial for identifying real problems. By speaking with users, we were able to hone in on their actual pain points and design a solution that directly addressed them.

- We gained a deep understanding of high-dimensional vector spaces and how they can be leveraged to retrieve semantic meaning, improving the accuracy of our email search.

- Fast-paced development is both rewarding and risky. By keeping our development goals top-of-mind, we were able to reduce bugs, iterate quickly, and still deliver a polished product under tight time constraints.

## What's next for Scope 🌌👆

- Integrate with email server protocols instead of relying solely on the Google API, allowing Scope to support a wider range of email services and offer greater flexibility.
  
- Build out mail extensions for a seamless experience, enabling users to access Scope through a global keyboard shortcut, similar to Spotlight search, for even faster email querying.

- We're excited to take Scope to the next level! Over the coming weeks, we'll be refining the product, setting up meetings with potential stakeholders, and working to identify a strong product-market fit.
