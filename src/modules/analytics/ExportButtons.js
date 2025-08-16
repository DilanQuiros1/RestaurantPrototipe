import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  GetApp as GetAppIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ExportButtons = ({ data, kpis }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportType, setExportType] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState({
    id: true,
    date: true,
    customerName: true,
    orderType: true,
    total: true,
    paymentMethod: true,
    status: true
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const getOrderTypeLabel = (type) => {
    return type === 'dine-in' ? 'Comer Aquí' : 'Para Llevar';
  };

  const handleColumnChange = (column) => {
    setSelectedColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const generatePDFSummary = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(25, 118, 210);
    doc.text('Reporte de Métricas - Restaurant SaaS', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 30, { align: 'center' });
    
    let yPosition = 50;
    
    // KPIs Summary
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Resumen de KPIs', 20, yPosition);
    yPosition += 15;
    
    const kpiData = [
      ['Métrica', 'Hoy', 'Esta Semana', 'Este Mes'],
      ['Ventas Totales', 
        formatCurrency(kpis.today?.totalSales || 0),
        formatCurrency(kpis.week?.totalSales || 0),
        formatCurrency(kpis.month?.totalSales || 0)
      ],
      ['Órdenes Totales',
        (kpis.today?.totalOrders || 0).toString(),
        (kpis.week?.totalOrders || 0).toString(),
        (kpis.month?.totalOrders || 0).toString()
      ],
      ['Ticket Promedio',
        formatCurrency(kpis.today?.averageTicket || 0),
        formatCurrency(kpis.week?.averageTicket || 0),
        formatCurrency(kpis.month?.averageTicket || 0)
      ]
    ];
    
    doc.autoTable({
      head: [kpiData[0]],
      body: kpiData.slice(1),
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [25, 118, 210] },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 20;
    
    // Top Products
    if (kpis.week?.topProducts && kpis.week.topProducts.length > 0) {
      doc.setFontSize(16);
      doc.text('Top 5 Productos (Esta Semana)', 20, yPosition);
      yPosition += 10;
      
      const productsData = [
        ['Posición', 'Producto', 'Cantidad', 'Ingresos'],
        ...kpis.week.topProducts.slice(0, 5).map((product, index) => [
          `#${index + 1}`,
          product.name,
          product.quantity.toString(),
          formatCurrency(product.revenue)
        ])
      ];
      
      doc.autoTable({
        head: [productsData[0]],
        body: productsData.slice(1),
        startY: yPosition,
        theme: 'striped',
        headStyles: { fillColor: [46, 125, 50] },
        margin: { left: 20, right: 20 }
      });
    }
    
    return doc;
  };

  const generatePDFDetailed = () => {
    const doc = new jsPDF('l'); // Landscape for more columns
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(25, 118, 210);
    doc.text('Reporte Detallado de Órdenes', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Total de registros: ${data.length} | Generado: ${new Date().toLocaleDateString('es-ES')}`, 
              pageWidth / 2, 30, { align: 'center' });
    
    // Filter selected columns
    const columns = [];
    const headers = [];
    
    if (selectedColumns.id) { columns.push('id'); headers.push('ID'); }
    if (selectedColumns.date) { columns.push('date'); headers.push('Fecha'); }
    if (selectedColumns.customerName) { columns.push('customerName'); headers.push('Cliente'); }
    if (selectedColumns.orderType) { columns.push('orderType'); headers.push('Tipo'); }
    if (selectedColumns.total) { columns.push('total'); headers.push('Total'); }
    if (selectedColumns.paymentMethod) { columns.push('paymentMethod'); headers.push('Pago'); }
    if (selectedColumns.status) { columns.push('status'); headers.push('Estado'); }
    
    const tableData = data.map(order => {
      const row = [];
      if (selectedColumns.id) row.push(order.id);
      if (selectedColumns.date) row.push(formatDate(order.date));
      if (selectedColumns.customerName) row.push(order.customerName);
      if (selectedColumns.orderType) row.push(getOrderTypeLabel(order.orderType));
      if (selectedColumns.total) row.push(formatCurrency(order.total));
      if (selectedColumns.paymentMethod) row.push(order.paymentMethod);
      if (selectedColumns.status) row.push(getStatusLabel(order.status));
      return row;
    });
    
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [25, 118, 210] },
      styles: { fontSize: 8 },
      margin: { left: 10, right: 10 }
    });
    
    return doc;
  };

  const generateExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    if (exportType === 'summary') {
      // KPIs Sheet
      const kpiData = [
        ['Métricas del Restaurante'],
        ['Generado el:', new Date().toLocaleDateString('es-ES')],
        [],
        ['Métrica', 'Hoy', 'Esta Semana', 'Este Mes'],
        ['Ventas Totales', kpis.today?.totalSales || 0, kpis.week?.totalSales || 0, kpis.month?.totalSales || 0],
        ['Órdenes Totales', kpis.today?.totalOrders || 0, kpis.week?.totalOrders || 0, kpis.month?.totalOrders || 0],
        ['Ticket Promedio', kpis.today?.averageTicket || 0, kpis.week?.averageTicket || 0, kpis.month?.averageTicket || 0],
        [],
        ['Top Productos (Esta Semana)'],
        ['Posición', 'Producto', 'Cantidad', 'Ingresos']
      ];
      
      if (kpis.week?.topProducts) {
        kpis.week.topProducts.slice(0, 5).forEach((product, index) => {
          kpiData.push([`#${index + 1}`, product.name, product.quantity, product.revenue]);
        });
      }
      
      const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
      XLSX.utils.book_append_sheet(workbook, kpiSheet, 'Resumen KPIs');
    }
    
    // Orders Sheet
    const ordersData = [['ID', 'Fecha', 'Cliente', 'Tipo', 'Mesa', 'Items', 'Subtotal', 'IVA', 'Descuento', 'Total', 'Método Pago', 'Estado']];
    
    data.forEach(order => {
      ordersData.push([
        order.id,
        formatDate(order.date),
        order.customerName,
        getOrderTypeLabel(order.orderType),
        order.tableNumber || 'N/A',
        order.items?.length || 0,
        order.subtotal,
        order.tax,
        order.discount,
        order.total,
        order.paymentMethod,
        getStatusLabel(order.status)
      ]);
    });
    
    const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Órdenes Detalladas');
    
    return workbook;
  };

  const generateCSV = () => {
    const headers = [];
    const rows = [];
    
    // Build headers based on selected columns
    if (selectedColumns.id) headers.push('ID');
    if (selectedColumns.date) headers.push('Fecha');
    if (selectedColumns.customerName) headers.push('Cliente');
    if (selectedColumns.orderType) headers.push('Tipo');
    if (selectedColumns.total) headers.push('Total');
    if (selectedColumns.paymentMethod) headers.push('Método de Pago');
    if (selectedColumns.status) headers.push('Estado');
    
    rows.push(headers.join(';'));
    
    data.forEach(order => {
      const row = [];
      if (selectedColumns.id) row.push(order.id);
      if (selectedColumns.date) row.push(formatDate(order.date));
      if (selectedColumns.customerName) row.push(order.customerName);
      if (selectedColumns.orderType) row.push(getOrderTypeLabel(order.orderType));
      if (selectedColumns.total) row.push(order.total);
      if (selectedColumns.paymentMethod) row.push(order.paymentMethod);
      if (selectedColumns.status) row.push(getStatusLabel(order.status));
      rows.push(row.join(';'));
    });
    
    return rows.join('\n');
  };

  const handleExport = async () => {
    setLoading(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      switch (exportFormat) {
        case 'pdf':
          const doc = exportType === 'summary' ? generatePDFSummary() : generatePDFDetailed();
          doc.save(`reporte-${exportType}-${timestamp}.pdf`);
          break;
          
        case 'excel':
          const workbook = generateExcel();
          XLSX.writeFile(workbook, `reporte-${exportType}-${timestamp}.xlsx`);
          break;
          
        case 'csv':
          const csvContent = generateCSV();
          const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `reporte-${exportType}-${timestamp}.csv`;
          link.click();
          break;
      }
      
      // Save export configuration to localStorage
      const exportConfig = {
        format: exportFormat,
        type: exportType,
        columns: selectedColumns,
        timestamp: new Date().toISOString()
      };
      
      const savedConfigs = JSON.parse(localStorage.getItem('exportConfigs') || '[]');
      savedConfigs.unshift(exportConfig);
      localStorage.setItem('exportConfigs', JSON.stringify(savedConfigs.slice(0, 10))); // Keep last 10
      
    } catch (error) {
      console.error('Error generating export:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedConfig = (config) => {
    setExportFormat(config.format);
    setExportType(config.type);
    setSelectedColumns(config.columns);
  };

  const savedConfigs = JSON.parse(localStorage.getItem('exportConfigs') || '[]');

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Exportar Reportes
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Configuración de Exportación
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Formato de Archivo</InputLabel>
                    <Select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      label="Formato de Archivo"
                    >
                      <MenuItem value="pdf">
                        <Box display="flex" alignItems="center" gap={1}>
                          <PdfIcon color="error" />
                          PDF
                        </Box>
                      </MenuItem>
                      <MenuItem value="excel">
                        <Box display="flex" alignItems="center" gap={1}>
                          <ExcelIcon color="success" />
                          Excel (.xlsx)
                        </Box>
                      </MenuItem>
                      <MenuItem value="csv">
                        <Box display="flex" alignItems="center" gap={1}>
                          <CsvIcon color="primary" />
                          CSV
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Reporte</InputLabel>
                    <Select
                      value={exportType}
                      onChange={(e) => setExportType(e.target.value)}
                      label="Tipo de Reporte"
                    >
                      <MenuItem value="summary">Resumen Ejecutivo</MenuItem>
                      <MenuItem value="detailed">Reporte Detallado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {exportType === 'detailed' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Columnas a Incluir:
                    </Typography>
                    <FormGroup row>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedColumns.id}
                            onChange={() => handleColumnChange('id')}
                          />
                        }
                        label="ID Orden"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedColumns.date}
                            onChange={() => handleColumnChange('date')}
                          />
                        }
                        label="Fecha"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedColumns.customerName}
                            onChange={() => handleColumnChange('customerName')}
                          />
                        }
                        label="Cliente"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedColumns.orderType}
                            onChange={() => handleColumnChange('orderType')}
                          />
                        }
                        label="Tipo"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedColumns.total}
                            onChange={() => handleColumnChange('total')}
                          />
                        }
                        label="Total"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedColumns.paymentMethod}
                            onChange={() => handleColumnChange('paymentMethod')}
                          />
                        }
                        label="Método Pago"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedColumns.status}
                            onChange={() => handleColumnChange('status')}
                          />
                        }
                        label="Estado"
                      />
                    </FormGroup>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} /> : <GetAppIcon />}
                    onClick={handleExport}
                    disabled={loading}
                    sx={{ mr: 2 }}
                  >
                    {loading ? 'Generando...' : 'Exportar Reporte'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Configuraciones Guardadas
              </Typography>
              
              {savedConfigs.length === 0 ? (
                <Alert severity="info">
                  No hay configuraciones guardadas
                </Alert>
              ) : (
                <Box>
                  {savedConfigs.slice(0, 5).map((config, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SaveIcon />}
                        onClick={() => loadSavedConfig(config)}
                        fullWidth
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        {config.format.toUpperCase()} - {config.type}
                      </Button>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
                        {new Date(config.timestamp).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Estadísticas de Exportación
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Total de registros: <strong>{data.length}</strong>
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Registros completados: <strong>{data.filter(d => d.status === 'completed').length}</strong>
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Ventas totales: <strong>{formatCurrency(data.reduce((sum, order) => sum + (order.status === 'completed' ? order.total : 0), 0))}</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExportButtons;
