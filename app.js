const { MongoClient } = require('mongodb');
// Connection URL
const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);
async function main() {
try {
// Connect to the MongoDB cluster
       await client.connect();
// Create a single new document
       await createdoc(client, "se1900_db", "Students", {
            "StudentID": 1, "Name": "John Doe", "Age": 20
});
// 2. Read: Đọc/Tìm kiếm document
        await readdoc(client, "se1900_db", "Students", { "StudentID": 1 });

        // 3. Update: Cập nhật document
        await updatedoc(client, "se1900_db", "Students", { "StudentID": 1 }, { $set: { "Age": 21 } });

        // 4. Delete: Xóa document (bạn có thể bỏ comment nếu muốn test xóa)
        // await deletedoc(client, "se1900_db", "Students", { "StudentID": 1 });
} catch (e) {
 console.error(e);
 } finally {
 // Close the connection to the MongoDB cluster
        await client.close();
    }
}
main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());
async function createdoc(client, se1900_db, Students, doc) {
    const dbobj = await client.db("se1900_db");
    const col = dbobj.collection("Students");
    const result = await col.insertOne(doc);
    console.log(`New document created with the following id: ${result.insertedId}`);
}
// Hàm Read (Đọc dữ liệu)
async function readdoc(client, dbName, collName, query) {
    const dbobj = await client.db(dbName);
    const col = dbobj.collection(collName);
    const result = await col.findOne(query);
    console.log("Found document:", result);
}

// Hàm Update (Cập nhật dữ liệu)
async function updatedoc(client, dbName, collName, filter, updateDoc) {
    const dbobj = await client.db(dbName);
    const col = dbobj.collection(collName);
    const result = await col.updateOne(filter, updateDoc);
    console.log(`Document updated, modified count: ${result.modifiedCount}`);
}

// Hàm Delete (Xóa dữ liệu)
async function deletedoc(client, dbName, collName, filter) {
    const dbobj = await client.db(dbName);
    const col = dbobj.collection(collName);
    const result = await col.deleteOne(filter);
    console.log(`Document deleted, deleted count: ${result.deletedCount}`);
}