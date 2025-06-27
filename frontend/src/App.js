import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
import './App.css';

// --- Icon Components (using inline SVG for simplicity) ---
const DashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>);
const ProductsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>);
const ReportsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);
const AiIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>);

// --- Main Application Component ---
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: 'Group - 04', email: 'admin@cloudproject.com', role: 'Admin', profilePic: 'https://placehold.co/40x40/E2E8F0/4A5568?text=G4' });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [productToShow, setProductToShow] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const showToast = (message) => { setToast({ show: true, message }); setTimeout(() => setToast({ show: false, message: '' }), 3000); };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/GetProducts`);
      setAllProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([ { id: 'ERR-001', name: 'Could not load data from backend', currentQty: 0, reorderLevel: 0 }, ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAddProduct = async (newProduct) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/UpsertProduct`, newProduct);
      setShowAddProductModal(false);
      fetchProducts();
      showToast("Product added successfully!");
    } catch (error) { console.error('Error adding product:', error); alert('Failed to add product.'); }
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/UpsertProduct`, updatedProduct);
      fetchProducts();
      showToast("Product updated successfully!");
    } catch (error) { console.error('Error updating product:', error); alert('Failed to update product.'); }
  };

  const handleProfileUpdate = (updatedProfile) => { setUserProfile(updatedProfile); showToast("Settings saved successfully!"); };
  const handleShowProductDetails = (productId) => { setProductToShow(productId); setCurrentPage('products'); };

  const handleGetAiSuggestion = async () => {
    setAiSuggestion('');
    setShowAiModal(true);
    setIsAiLoading(true);

    const lowStockItems = allProducts.filter(p => p.currentQty <= p.reorderLevel);
    if (lowStockItems.length === 0) {
        setAiSuggestion("No items are currently low on stock. Great job!");
        setIsAiLoading(false);
        return;
    }

    const productList = lowStockItems.map(p => `- ${p.name} (Current: ${p.currentQty}, Reorder Level: ${p.reorderLevel})`).join('\n');
    const prompt = `As an expert inventory manager for a restaurant, analyze the following list of low-stock items. Write a concise and professional reorder suggestion email body to a supplier. Recommend a quantity to order for each item to reach a target stock level of double the reorder level. Low Stock Items:\n${productList}`;

    try {
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = "AIzaSyC3hdRj3XzCsYnBcZJf01LwE99yCDo5ykM";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
        const result = await response.json();
        if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
            setAiSuggestion(result.candidates[0].content.parts[0].text);
        } else { throw new Error("Unexpected response format from AI."); }
    } catch (error) {
        console.error("Error fetching AI suggestion:", error);
        setAiSuggestion("Sorry, there was an error getting a suggestion from the AI assistant.");
    } finally {
        setIsAiLoading(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage products={allProducts} loading={loading} onAddProductClick={() => setShowAddProductModal(true)} onUpdateProduct={handleUpdateProduct} onShowDetails={handleShowProductDetails} onGetAiSuggestion={handleGetAiSuggestion} />;
      case 'products': return <ProductsPage allProducts={allProducts} productToShow={productToShow} setProductToShow={setProductToShow} />;
      case 'reports': return <ReportsPage products={allProducts} />;
      case 'settings': return <SettingsPage userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />;
      default: return <DashboardPage products={allProducts} loading={loading} onAddProductClick={() => setShowAddProductModal(true)} onUpdateProduct={handleUpdateProduct} onShowDetails={handleShowProductDetails} onGetAiSuggestion={handleGetAiSuggestion}/>;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} userProfile={userProfile} />
      <main className="main-content">{renderPage()}</main>
      {showAddProductModal && (<AddProductModal onClose={() => setShowAddProductModal(false)} onAddProduct={handleAddProduct} />)}
      {showAiModal && (<AiAssistantModal onClose={() => setShowAiModal(false)} suggestion={aiSuggestion} isLoading={isAiLoading}/>)}
      {toast.show && <Toast message={toast.message} />}
    </div>
  );
}

const Sidebar = ({ currentPage, setCurrentPage, userProfile }) => (
  <aside className="sidebar">
    <div className="sidebar-header">
      <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 9 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
      <span className="logo-text">Stock-Alert</span>
    </div>
    <nav className="sidebar-nav">
      <a href="/#" onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard') }} className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}><DashboardIcon /> <span>Dashboard</span></a>
      <a href="/#" onClick={(e) => { e.preventDefault(); setCurrentPage('products') }} className={`nav-item ${currentPage === 'products' ? 'active' : ''}`}><ProductsIcon /> <span>Products</span></a>
      <a href="/#" onClick={(e) => { e.preventDefault(); setCurrentPage('reports') }} className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}><ReportsIcon /> <span>Reports</span></a>
      <a href="/#" onClick={(e) => { e.preventDefault(); setCurrentPage('settings') }} className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}><SettingsIcon /> <span>Settings</span></a>
    </nav>
    <div className="sidebar-footer">
      <div className="user-profile">
        <img src={userProfile.profilePic} alt="User Avatar" className="user-avatar" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/40x40/E2E8F0/4A5568?text=U'; }}/>
        <div className="user-info"><span className="user-name">{userProfile.name}</span><span className="user-role">{userProfile.role}</span></div>
      </div>
    </div>
  </aside>
);

const DashboardPage = ({ products, loading, onAddProductClick, onUpdateProduct, onShowDetails, onGetAiSuggestion }) => {
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingProductId, setEditingProductId] = useState(null);
    const [editedData, setEditedData] = useState({});
    const handleEditClick = (product) => { setEditingProductId(product.id); setEditedData({ currentQty: product.currentQty, reorderLevel: product.reorderLevel }); };
    const handleCancelClick = () => { setEditingProductId(null); setEditedData({}); };
    const handleSaveClick = (productId) => {
        const originalProduct = products.find(p => p.id === productId);
        if (!originalProduct) { console.error("Could not find the product to update."); alert("An unexpected error occurred."); return; }
        const updatedProduct = { ...originalProduct, ...editedData };
        onUpdateProduct(updatedProduct);
        setEditingProductId(null);
    };
    const handleInputChange = (e) => { const { name, value } = e.target; setEditedData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) })); };
    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(products.length / itemsPerPage);
    const displayedProducts = itemsPerPage === 'all' ? products : products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const handleItemsPerPageChange = (e) => { setItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value)); setCurrentPage(1); };
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.currentQty <= p.reorderLevel).length;
    const stockValue = products.reduce((acc, p) => acc + (p.currentQty * (p.price || 25)), 0);
    return (
        <>
            <header className="main-header"><h1>Inventory Status</h1><div className="header-actions"><button onClick={onGetAiSuggestion} className="ai-assistant-btn"><AiIcon /><span>AI Assistant</span></button><button onClick={onAddProductClick} className="add-product-btn">+ Add New Product</button></div></header>
            <section className="kpi-cards"><div className="kpi-card"><h2 className="kpi-title">Total Products</h2><p className="kpi-value">{loading ? '...' : totalProducts}</p></div><div className="kpi-card low-stock-card"><h2 className="kpi-title">Items Low on Stock</h2><p className="kpi-value">{loading ? '...' : lowStockProducts}</p></div><div className="kpi-card"><h2 className="kpi-title">Total Stock Value</h2><p className="kpi-value">{loading ? '...' : `$${stockValue.toLocaleString()}`}</p></div><div className="kpi-card"><h2 className="kpi-title">Supplier Count</h2><p className="kpi-value">{loading ? '...' : '12'}</p></div></section>
            <section className="products-table-section">
                <div className="table-header"><h2>All Products</h2></div>
                <div className="table-container">
                    <table>
                        <thead><tr><th>Status</th><th>Product Name</th><th>Current Qty</th><th>Reorder Level</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (<tr><td colSpan="5" className="loading-text">Loading Products...</td></tr>) : (
                                displayedProducts.map(product => (
                                    <tr key={product.id}>
                                        <td><span className={`status-dot ${product.currentQty <= product.reorderLevel ? 'status-low' : 'status-ok'}`}></span></td>
                                        <td className="product-name">{product.name}</td>
                                        <td>{editingProductId === product.id ? (<input type="number" name="currentQty" value={editedData.currentQty} onChange={handleInputChange} className="inline-edit-input" />) : (product.currentQty)}</td>
                                        <td>{editingProductId === product.id ? (<input type="number" name="reorderLevel" value={editedData.reorderLevel} onChange={handleInputChange} className="inline-edit-input" />) : (product.reorderLevel)}</td>
                                        <td className="actions-cell">{editingProductId === product.id ? ( <><button onClick={() => handleSaveClick(product.id)} className="action-btn save">Save</button><button onClick={handleCancelClick} className="action-btn cancel">Cancel</button></> ) : ( <><button onClick={() => onShowDetails(product.id)} className="action-btn">Details</button><button onClick={() => handleEditClick(product)} className="action-btn edit">Edit</button></> )}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && products.length > 0 && (
                    <div className="table-footer">
                        <div className="items-per-page-selector"><label htmlFor="items-per-page">Rows per page:</label><select id="items-per-page" value={itemsPerPage} onChange={handleItemsPerPageChange}><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="all">All</option></select></div>
                        <div className="pagination-info">Page {currentPage} of {totalPages}</div>
                        <div className="pagination-controls"><button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">Previous</button><button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="pagination-btn">Next</button></div>
                    </div>
                )}
            </section>
        </>
    );
};

const AddProductModal = ({ onClose, onAddProduct }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [currentQty, setCurrentQty] = useState('');
    const [reorderLevel, setReorderLevel] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); onAddProduct({ id, name, currentQty: Number(currentQty), reorderLevel: Number(reorderLevel) }); };
    return ( <div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h2>Add New Product</h2><button onClick={onClose} className="close-btn"><CloseIcon /></button></div><form onSubmit={handleSubmit} className="modal-form"><div className="form-group"><label htmlFor="prod-id">Product ID</label><input type="text" id="prod-id" value={id} onChange={e => setId(e.target.value)} required /></div><div className="form-group"><label htmlFor="prod-name">Product Name</label><input type="text" id="prod-name" value={name} onChange={e => setName(e.target.value)} required /></div><div className="form-group"><label htmlFor="prod-qty">Current Quantity</label><input type="number" id="prod-qty" value={currentQty} onChange={e => setCurrentQty(e.target.value)} required /></div><div className="form-group"><label htmlFor="prod-reorder">Reorder Level</label><input type="number" id="prod-reorder" value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} required /></div><div className="modal-footer"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Add Product</button></div></form></div></div> );
};

const ProductsPage = ({ allProducts, productToShow, setProductToShow }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  useEffect(() => { if (productToShow) { const product = allProducts.find(p => p.id === productToShow); if (product) { setSelectedProduct(product); } setProductToShow(null); } else if (!selectedProduct && allProducts.length > 0) { setSelectedProduct(allProducts[0]); } }, [productToShow, allProducts, selectedProduct, setProductToShow]);
  const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return ( <> <header className="main-header"><h1>Product Management</h1></header> <div className="products-page-layout"> <div className="products-list-panel"> <div className="search-bar-wrapper"><SearchIcon /><input type="text" placeholder="Search products..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div> <div className="product-cards-grid"> {filteredProducts.map(p => ( <div key={p.id} className={`product-card ${selectedProduct?.id === p.id ? 'active' : ''}`} onClick={() => setSelectedProduct(p)}> <div className="product-card-info"><span className="product-card-name">{p.name}</span><span className="product-card-id">{p.id}</span></div> <div className={`product-card-status ${p.currentQty <= p.reorderLevel ? 'low' : 'ok'}`}>{p.currentQty <= p.reorderLevel ? 'Low' : 'OK'}</div> </div> ))} </div> </div> <div className="product-details-panel"> {selectedProduct ? ( <> <h3>{selectedProduct.name}</h3> <div className="stock-progress-container"> <div className="stock-progress-bar-wrapper"><div className="stock-progress-bar" style={{ width: `${Math.min((selectedProduct.currentQty / (selectedProduct.reorderLevel * 2)) * 100, 100)}%`, background: selectedProduct.currentQty <= selectedProduct.reorderLevel ? '#FCA5A5' : '#86EFAC'}}></div></div> <span className="stock-progress-label">{selectedProduct.currentQty} / {selectedProduct.reorderLevel * 2} (Target)</span> </div> <div className="details-grid"> <div><span>Product ID</span> {selectedProduct.id}</div> <div><span>Status</span> {selectedProduct.currentQty <= selectedProduct.reorderLevel ? 'Needs Reorder' : 'Sufficient Stock'}</div> <div><span>Current Stock</span> {selectedProduct.currentQty} units</div> <div><span>Reorder Level</span> {selectedProduct.reorderLevel} units</div> <div><span>Estimated Monthly Usage</span> {Math.round(selectedProduct.reorderLevel * 2.5)} units</div> <div><span>Last Ordered</span> 3 weeks ago</div> </div> </> ) : ( <div className="placeholder-text">Select a product to see details.</div> )} </div> </div> </> );
};

const ReportsPage = ({ products }) => {
    const exportToCSV = () => { /* ... */ };
    const exportToPDF = () => { /* ... */ };
    const highestStock = products.reduce((max, p) => p.currentQty > max.currentQty ? p : max, products[0] || {});
    const lowestStock = products.reduce((min, p) => p.currentQty < min.currentQty ? p : min, products[0] || {});
    const totalValue = products.reduce((acc, p) => acc + (p.currentQty * (p.price || 25)), 0);
    return ( <> <header className="main-header"><h1>Inventory Reports</h1><div className="export-buttons"><button onClick={exportToCSV} className="btn-secondary">Export to CSV</button><button onClick={exportToPDF} className="btn-primary">Generate PDF Report</button></div></header> <section className="kpi-cards"> <div className="kpi-card"><h2 className="kpi-title">Highest Stock Item</h2><p className="kpi-value-small">{highestStock?.name || 'N/A'}</p><p className="kpi-sub-value">{highestStock?.currentQty || 0} units</p></div> <div className="kpi-card"><h2 className="kpi-title">Item Most in Need</h2><p className="kpi-value-small">{lowestStock?.name || 'N/A'}</p><p className="kpi-sub-value" style={{color: '#DC2626'}}>{lowestStock?.currentQty || 0} units</p></div> <div className="kpi-card"><h2 className="kpi-title">Total Inventory Value</h2><p className="kpi-value-small">{`$${totalValue.toLocaleString()}`}</p><p className="kpi-sub-value">Across {products.length} products</p></div> </section> <div className="reports-container"> <div className="chart-container"><h4>Stock Levels Overview (Top 10)</h4><div className="bar-chart">{products.slice(0, 10).map(p => (<div className="bar-wrapper" key={p.id}><div className="bar" style={{ height: `${p.currentQty * 2}px`, background: p.currentQty <= p.reorderLevel ? '#EF4444' : '#22C55E' }}><span className="bar-label">{p.currentQty}</span></div><span className="bar-title">{p.name.split(' ')[0]}</span></div>))}</div></div> <div className="products-table-section"><div className="table-header"><h2>Generated Reports</h2></div><div className="table-container" style={{minHeight: '200px'}}><table><thead><tr><th>Report ID</th><th>Date Generated</th><th>Items Found</th><th>Actions</th></tr></thead><tbody><tr><td>rep-20250615-1</td><td>2025-06-15 12:00 AM</td><td>3</td><td><button className="action-btn">View</button></td></tr><tr><td>rep-20250614-1</td><td>2025-06-14 12:00 AM</td><td>5</td><td><button className="action-btn">View</button></td></tr></tbody></table></div></div> </div> </> );
};

const SettingsPage = ({ userProfile, onProfileUpdate }) => {
    const [formData, setFormData] = useState(userProfile);
    const [isDirty, setIsDirty] = useState(false);
    useEffect(() => { setFormData(userProfile); }, [userProfile]);
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); setIsDirty(true); };
    const handleProfilePicChange = (e) => { if (e.target.files && e.target.files[0]) { const reader = new FileReader(); reader.onload = (event) => { setFormData(prev => ({ ...prev, profilePic: event.target.result })); setIsDirty(true); }; reader.readAsDataURL(e.target.files[0]); } };
    const handleSaveChanges = (e) => { e.preventDefault(); onProfileUpdate(formData); setIsDirty(false); };
    return ( <> <header className="main-header"><h1>Account Settings</h1><button className="btn-primary" onClick={handleSaveChanges} disabled={!isDirty}>{isDirty ? 'Save Changes' : 'Saved'}</button></header> <div className="settings-container"><div className="settings-card"><h3>Profile Information</h3><div className="profile-settings"><div className="profile-pic-container"><img src={formData.profilePic} alt="User Avatar"/><label htmlFor="profile-pic-upload" className="change-pic-btn"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></label><input id="profile-pic-upload" type="file" accept="image/*" onChange={handleProfilePicChange} style={{ display: 'none' }} /></div><div className="profile-info-fields"><div className="form-group"><label>Full Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} /></div><div className="form-group"><label>Role</label><input type="text" value={formData.role} disabled /></div></div></div></div><div className="settings-card"><h3>Account Credentials</h3><div className="form-group"><label>Email Address</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} /></div><div className="form-group"><label>Password</label><input type="password" placeholder="••••••••" /></div><button className="btn-secondary">Change Password</button></div></div> </> );
};

const Toast = ({ message }) => (<div className="toast-notification"><CheckIcon />{message}</div>);

const AiAssistantModal = ({ onClose, suggestion, isLoading }) => {
  return ( <div className="modal-overlay"><div className="modal-content ai-modal"><div className="modal-header"><h2><AiIcon /> AI Reorder Assistant</h2><button onClick={onClose} className="close-btn"><CloseIcon /></button></div><div className="ai-suggestion-box">{isLoading ? ( <div className="loading-spinner-container"><div className="loading-spinner"></div><p>Generating suggestion...</p></div> ) : ( <pre>{suggestion}</pre> )}</div><div className="modal-footer"><button type="button" onClick={onClose} className="btn-primary">Close</button></div></div></div> );
};

export default App;

// AIzaSyC3hdRj3XzCsYnBcZJf01LwE99yCDo5ykM
