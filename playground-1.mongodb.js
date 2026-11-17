// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("routes");

// Find a document in a collection.
db.getCollection("entries").updateMany(
    { "routes.mode": "bus" },
    { $set: { "routes.$[elem].trnnm": "roadways" } },
    {
        arrayFilters: [{ "elem.mode": "bus" }]
    }
);

