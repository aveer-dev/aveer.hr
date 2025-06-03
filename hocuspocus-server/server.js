import 'dotenv/config';
import { Server } from '@hocuspocus/server';
import { createClient } from '@supabase/supabase-js';
import * as Y from 'yjs';

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || !supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
	console.error('🚨 Supabase URL or Anon Key not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables or update them in the code.');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// const getDocumentId = documentName => {
// 	const name = documentName.split('-');
// 	const id = name[0];
// 	const documentId = name[1];
// 	return { documentId, id };
// };

// 2. Configure the Hocuspocus Server
const server = new Server({
	port: process.env.PORT || 1234,

	// 👇 Optional: Add authentication (highly recommended for production)
	// async onAuthenticate(data) {
	// 	const { token } = data; // Assuming you pass a Supabase JWT from the client

	// 	if (!token) {
	// 		throw new Error('Not authorized! No token provided.');
	// 	}

	// 	try {
	// 		const {
	// 			data: { user },
	// 			error
	// 		} = await supabase.auth.getUser(token);

	// 		if (error || !user) {
	// 			console.error('Authentication error:', error.message);
	// 			throw new Error('Not authorized! Invalid token.');
	// 		}

	// 		// You can pass user information to other hooks
	// 		return {
	// 			user: {
	// 				id: user.id,
	// 				email: user.email,
	// 				name: `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
	// 				// any other user data you want to associate with the connection
	// 			},
	// 			token // Make the token available in other hooks if needed
	// 		};
	// 	} catch (err) {
	// 		console.error('onAuthenticate error:', err?.message);
	// 		throw new Error('Authentication failed!');
	// 	}
	// },

	// 👇 Load document from Supabase
	async onLoadDocument(data) {
		// console.log('onLoadDocument', data);
		const { documentName, context } = data; // context contains data from onAuthenticate
		console.log(`📄 Loading document: ${documentName}`);
		// Optional: Check if the authenticated user has permission to load this document
		// if (context.user) {
		//   console.log(`User ${context.user.id} is trying to load ${documentName}`);
		//   // Add your authorization logic here, e.g., check a 'document_permissions' table
		// }

		// Example: Assuming you have a table named 'documents' with
		// columns 'name' (TEXT, PRIMARY KEY) and 'data' (BYTEA or TEXT for Y.js update)
		const { data: doc, error } = await supabase
			.from('hocuspocus_documents') // Replace 'documents' with your actual table name
			.select('data')
			.eq('name', documentName)
			.maybeSingle(); // Use maybeSingle() if the document might not exist

		if (error) {
			console.error('Error loading document from Supabase:', error);
			throw new Error('Could not load document');
		}

		if (doc && doc.data) {
			// If data is stored as a Uint8Array (BYTEA in Supabase), convert it.
			// If stored as base64 string, decode it first.
			// This example assumes it's stored in a format directly usable by Y.Doc.
			// For BYTEA, Supabase client might return a string that needs conversion, or you might need to handle ArrayBuffer.
			// Let's assume doc.data is a Uint8Array or can be converted to one.
			// If you stored it as a base64 string:
			// const uint8ArrayData = Uint8Array.from(atob(doc.data), c => c.charCodeAt(0));
			// return Y.applyUpdateV2(new Y.Doc(), uint8ArrayData);

			// If your 'data' column is of type BYTEA, Supabase client might return it as a string.
			// You might need to ensure it's properly converted to Uint8Array.
			// This part heavily depends on how you decided to store the Yjs document data.
			// A common way is to store the Yjs document state vector or update.
			// For simplicity, let's assume it's a Uint8Array that can be directly applied.
			// If you're storing the full Yjs document state as binary:
			try {
				// If doc.data is a hex string representation of bytea from Supabase:
				if (typeof doc.data === 'string' && doc.data.startsWith('\\x')) {
					const hexString = doc.data.substring(2); // Remove '\\x'
					const byteArray = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
					return Y.applyUpdateV2(new Y.Doc(), byteArray, 'supabase');
				} else if (doc.data instanceof Uint8Array) {
					return Y.applyUpdateV2(new Y.Doc(), doc.data, 'supabase');
				} else {
					console.warn(`Document data for ${documentName} is not in expected Uint8Array or hex string format. Creating new document.`);
					return new Y.Doc(); // Or throw an error
				}
			} catch (e) {
				console.error(`Error applying update for ${documentName}:`, e?.message);
				return new Y.Doc(); // Fallback to a new document on error
			}
		}

		// If document doesn't exist, create a new Y.Doc
		console.log(`No existing document found for ${documentName}. Creating a new one.`);
		return new Y.Doc();
	},

	// 👇 Save document to Supabase
	async onStoreDocument(data) {
		const { documentName, document, context } = data;
		console.log(`💾 Storing document: ${documentName}`);
		// Optional: Check if the authenticated user has permission to store/modify this document
		// if (context.user) {
		//   console.log(`User ${context.user.id} is storing ${documentName}`);
		//   // Add your authorization logic here
		// }

		// Encode the Yjs document to a Uint8Array
		const ydocState = Y.encodeStateAsUpdateV2(document);

		// Store as BYTEA. Supabase client handles Uint8Array correctly for BYTEA.
		// If your column is TEXT, you might convert ydocState to a base64 string:
		// const base64Data = btoa(String.fromCharCode.apply(null, ydocState));
		const { error } = await supabase.from('hocuspocus_documents').upsert({ name: documentName, data: ydocState, updated_at: new Date().toISOString() }, { onConflict: 'name' });

		if (error) {
			console.error('Error storing document to Supabase:', error);
			throw new Error('Could not store document');
		}
		console.log(`✅ Document ${documentName} stored successfully.`);
	},

	// 👇 Optional: onChange can be used for more granular updates if needed,
	// but onStoreDocument is often sufficient for persisting the whole document.
	// async onChange(data) {
	//   const { documentName, document, context, updates } = data;
	//   console.log(`🔄 Document ${documentName} changed. Size of update: ${updates.length}`);
	//   // Here you could potentially store deltas/updates instead of the full document
	//   // This is more complex and depends on your specific needs.
	//   // For most cases, relying on onStoreDocument (which is debounced) is simpler.
	// },

	// 👇 Optional: Handle disconnections
	async onDisconnect(data) {
		const { documentName, connection, context } = data;
		console.log(`🔌 Connection closed for document ${documentName}. User: ${context.user?.id || 'anonymous'}`);
	},

	// 👇 Optional: Log connections
	async onConnect(data) {
		const { documentName, connection, requestParameters, context } = data;
		// `requestParameters` are URL parameters from the client's WebSocket connection string
		// e.g. ws://localhost:1234/collaboration?documentName=myDoc&token=USER_TOKEN
		console.log(`🔗 New connection for document ${documentName}. User: ${context.user?.name || 'anonymous'}`);
		// You could use requestParameters to pass additional info like a specific document ID
		// if not using the default documentName from the path.
	},

	async onCreatedDocument(data) {
		const { documentName, connection, requestParameters, context } = data;
		console.log(`🔗 New document created: ${documentName}. User: ${context.user?.id || 'anonymous'}`);
	},

	// Debounce for onStoreDocument (milliseconds)
	// This prevents saving on every single change, batching updates instead.
	debounce: 2000 // Store the document 2 seconds after the last change.
});

// You can also use the Database extension if your table structure is simple
// and matches what the extension expects (id: string, data: buffer).
// However, for more control with Supabase (e.g., specific column names, RLS, user association),
// the manual onLoadDocument and onStoreDocument approach above is more flexible.
/*
const dbExtension = Database.configure({
  fetch: async ({ documentName }) => {
    console.log(`DB Extension: Fetching ${documentName}`);
    const { data, error } = await supabase
      .from('documents')
      .select('data')
      .eq('name', documentName)
      .single(); // Use single() if the document MUST exist or you want an error if not

    if (error && error.code !== 'PGRST116') { // PGRST116: "Searched for a single row, but found no rows"
      console.error('DB Extension fetch error:', error);
      throw error;
    }
    return data ? data.data : null; // data.data should be Uint8Array
  },
  store: async ({ documentName, state }) => {
    console.log(`DB Extension: Storing ${documentName}`);
    const { error } = await supabase
      .from('documents')
      .upsert({ name: documentName, data: state, updated_at: new Date().toISOString() }, { onConflict: 'name' });
    if (error) {
      console.error('DB Extension store error:', error);
      throw error;
    }
  },
  // Optional: Control how often history is merged into the main document state before storing
  // onStoreDocument: 2000, // (This option is within the Database extension itself)
});

server.extensions = [dbExtension];
*/

server.listen();
console.log(`🚀 Hocuspocus server with Supabase integration is running on port ${server.options?.port}`);
