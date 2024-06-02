module.exports = mongoose => {
    const Blog = mongoose.model(
      "blog",
      mongoose.Schema(
        {
          title: String,
          description: String,
          image: String,
          author_image: String,
          short_description: String,
          author: String,
          type_: String,
          published: Boolean
        },
        { timestamps: true }
      )
    );
    return Blog;
  };