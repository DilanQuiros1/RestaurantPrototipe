import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarColumnsButton
} from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

const ReportsTable = ({ data }) => {
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  const getOrderTypeLabel = (type) => {
    return type === 'dine-in' ? 'Comer Aquí' : 'Para Llevar';
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID Orden',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'date',
      headerName: 'Fecha',
      width: 160,
      valueFormatter: (params) => formatDate(params.value)
    },
    {
      field: 'customerName',
      headerName: 'Cliente',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'orderType',
      headerName: 'Tipo',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getOrderTypeLabel(params.value)}
          size="small"
          color={params.value === 'dine-in' ? 'primary' : 'secondary'}
          variant="outlined"
        />
      )
    },
    {
      field: 'tableNumber',
      headerName: 'Mesa',
      width: 80,
      renderCell: (params) => (
        params.value ? `Mesa ${params.value}` : 'N/A'
      )
    },
    {
      field: 'itemsCount',
      headerName: 'Items',
      width: 80,
      renderCell: (params) => {
        const itemsCount = params.row?.items?.length || 0;
        return (
          <Typography variant="body2">
            {itemsCount}
          </Typography>
        );
      }
    },
    {
      field: 'subtotal',
      headerName: 'Subtotal',
      width: 120,
      valueFormatter: (params) => formatCurrency(params.value),
      type: 'number'
    },
    {
      field: 'tax',
      headerName: 'IVA',
      width: 100,
      valueFormatter: (params) => formatCurrency(params.value),
      type: 'number'
    },
    {
      field: 'discount',
      headerName: 'Descuento',
      width: 120,
      valueFormatter: (params) => formatCurrency(params.value),
      type: 'number',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ color: params.value > 0 ? '#4caf50' : '#666' }}
        >
          {params.value > 0 ? `-${formatCurrency(params.value)}` : formatCurrency(0)}
        </Typography>
      )
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      valueFormatter: (params) => formatCurrency(params.value),
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
          {formatCurrency(params.value)}
        </Typography>
      )
    },
    {
      field: 'paymentMethod',
      headerName: 'Pago',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          size="small"
          color={getStatusColor(params.value)}
        />
      )
    },
    {
      field: 'preparationTime',
      headerName: 'Tiempo Prep.',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value} min
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Ver detalles">
          <IconButton
            size="small"
            onClick={(e) => handleViewDetails(e, params.row)}
            disabled={!params.row}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!searchText) return data;
    
    return data.filter((row) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [data, searchText]);

  const handleViewDetails = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <GridToolbarExport 
            csvOptions={{
              fileName: `reporte-ordenes-${new Date().toISOString().split('T')[0]}`,
              delimiter: ';',
              utf8WithBom: true
            }}
          />
        </Box>
      </GridToolbarContainer>
    );
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Tabla de Reportes
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar en todas las columnas..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 400 }}
            />
          </Box>

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              pageSize={25}
              rowsPerPageOptions={[10, 25, 50, 100]}
              disableSelectionOnClick
              components={{
                Toolbar: CustomToolbar,
              }}
              sx={{
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #e0e0e0',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f5f5f5',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '2px solid #e0e0e0',
                  backgroundColor: '#f8f9fa',
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Order Details Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { minWidth: 300, maxWidth: 400 }
        }}
      >
        {selectedOrder && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Detalles de Orden {selectedOrder.id}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Cliente:</strong> {selectedOrder.customerName}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Fecha:</strong> {formatDate(selectedOrder.date)}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Tipo:</strong> {getOrderTypeLabel(selectedOrder.orderType)}
            </Typography>
            
            {selectedOrder.tableNumber && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Mesa:</strong> {selectedOrder.tableNumber}
              </Typography>
            )}
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Total:</strong> {formatCurrency(selectedOrder.total)}
            </Typography>
            
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Items:
            </Typography>
            
            {selectedOrder.items?.map((item, index) => (
              <Box key={index} sx={{ mb: 1, pl: 1 }}>
                <Typography variant="body2">
                  {item.quantity}x {item.productName} - {formatCurrency(item.subtotal)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Menu>
    </Box>
  );
};

export default ReportsTable;
