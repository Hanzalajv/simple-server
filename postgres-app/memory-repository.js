// In-memory storage (what we are replacing)
class MemoryRepository {
  constructor() {
    this.items = [];
    this.nextId = 1;
  }

  async getAll() {
    return this.items;
  }

  async add(name) {
    const item = { id: this.nextId++, name };
    this.items.push(item);
    return item;
  }
}

module.exports = MemoryRepository;