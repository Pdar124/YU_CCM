export const mapSnapshotDocs = (snapshot) =>
  snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));
