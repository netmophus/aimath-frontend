import api from '../api';

// Service pour la bibliothèque
export const libraryService = {
  // ===== MATIÈRES =====
  
  // Récupérer toutes les matières
  getSubjects: async () => {
    try {
      const response = await api.get('/library/subjects');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des matières:', error);
      throw error;
    }
  },

  // Créer une nouvelle matière
  createSubject: async (subjectData) => {
    try {
      const response = await api.post('/library/subjects', subjectData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la matière:', error);
      throw error;
    }
  },

  // Modifier une matière
  updateSubject: async (subjectId, subjectData) => {
    try {
      const response = await api.put(`/library/subjects/${subjectId}`, subjectData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la modification de la matière:', error);
      throw error;
    }
  },

  // Supprimer une matière
  deleteSubject: async (subjectId) => {
    try {
      const response = await api.delete(`/library/subjects/${subjectId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la matière:', error);
      throw error;
    }
  },

  // ===== LIVRES =====
  
  // Récupérer tous les livres
  getBooks: async () => {
    try {
      const response = await api.get('/library/books');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des livres:', error);
      throw error;
    }
  },

  // Récupérer les livres d'une matière
  getBooksBySubject: async (subjectId) => {
    try {
      const response = await api.get(`/library/subjects/${subjectId}/books`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des livres de la matière:', error);
      throw error;
    }
  },

  // Créer un nouveau livre
  createBook: async (bookData) => {
    try {
      const response = await api.post('/library/books', bookData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du livre:', error);
      throw error;
    }
  },

  // Modifier un livre
  updateBook: async (bookId, bookData) => {
    try {
      const response = await api.put(`/library/books/${bookId}`, bookData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la modification du livre:', error);
      throw error;
    }
  },

  // Supprimer un livre
  deleteBook: async (bookId) => {
    try {
      const response = await api.delete(`/library/books/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression du livre:', error);
      throw error;
    }
  },

  // ===== ADMIN =====
  
  // Récupérer toutes les matières (admin)
  getAdminSubjects: async () => {
    try {
      const response = await api.get('/admin/library/subjects');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des matières (admin):', error);
      throw error;
    }
  },

  // Récupérer tous les livres (admin)
  getAdminBooks: async () => {
    try {
      const response = await api.get('/admin/library/books');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des livres (admin):', error);
      throw error;
    }
  },

  // Créer une matière (admin)
  createAdminSubject: async (subjectData) => {
    try {
      const response = await api.post('/admin/library/subjects', subjectData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la matière (admin):', error);
      throw error;
    }
  },

  // Modifier une matière (admin)
  updateAdminSubject: async (subjectId, subjectData) => {
    try {
      const response = await api.put(`/admin/library/subjects/${subjectId}`, subjectData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la modification de la matière (admin):', error);
      throw error;
    }
  },

  // Supprimer une matière (admin)
  deleteAdminSubject: async (subjectId) => {
    try {
      const response = await api.delete(`/admin/library/subjects/${subjectId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la matière (admin):', error);
      throw error;
    }
  },

  // Créer un livre (admin)
  createAdminBook: async (bookData) => {
    try {
      const response = await api.post('/admin/library/books', bookData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du livre (admin):', error);
      throw error;
    }
  },

  // Modifier un livre (admin)
  updateAdminBook: async (bookId, bookData) => {
    try {
      const response = await api.put(`/admin/library/books/${bookId}`, bookData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la modification du livre (admin):', error);
      throw error;
    }
  },

  // Supprimer un livre (admin)
  deleteAdminBook: async (bookId) => {
    try {
      const response = await api.delete(`/admin/library/books/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression du livre (admin):', error);
      throw error;
    }
  }
};

export default libraryService;