import React, { useState, useEffect } from 'react';
import {
  Button, Box, Typography, TextField, MenuItem, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, Grid2, IconButton,
  useTheme, useMediaQuery, Collapse
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import baseApi from './baseApi';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { useForm } from 'react-hook-form';
import { LoaderBackdrop } from './LoaderBackdrop';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

dayjs.extend(utc);
dayjs.extend(timezone);
export default function EnhancedContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reset } = useForm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [fileTypeError, setFileTypeError] = useState(null);
  const [resolutionError, setResolutionError] = useState(null);
  const serviceId = localStorage.getItem("serviceId");
  const [no_of_content, setNo_of_contents] = useState(null);
  const [totalDuration, setTotalDuration] = useState(null);
  const [loading, setLoading] = useState(false);  //backdrop loader
  const [tableLoading, setTableLoading] = useState(false);  //loader text (loading...)
  const { label } = location.state || {};

  const projectNameMapping = {
    "5200": "STC",
    "5001": "AHA",
    "5010": "News9",
    "5028": "PLDT Cignal",
    "5028": "PLDT Plive",
    "5028": "PLDT Smart",
    "AMD": "amd_project",
    "Canela": "canela_project",
    "Cogeco": "cogeco_project",
    "MSG": "msg_project",
    "RSM": "rsm_project",
    "Telekom Malaysia": "telekom_malaysia_project",
    "YES": "yes_project",
    "GAME": "game_project",
    "Univision": "univision_project",
    "Starhub": "starhub_project"
  };

  const projectName = projectNameMapping[serviceId];

  const [filters, setFilters] = useState({
    service_id: serviceId,
    status: '',
    start_date: null,
    end_date: null,
    file_ext: '',
    file_type: '',
    resolution_type: ''
  });

  if (label === "PLDT Smart") {
    filters.prd_value = "smart";
  } else if (label === "PLDT Cignal") {
    filters.prd_value = "cignal";
  };

  const [dateError, setDateError] = useState(false);
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };
  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    await fetchData(newPage, rowsPerPage);
  };
  
  const handleChangeRowsPerPage = async (event) => {
    const newRowsPerPage = +event.target.value;
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    await fetchData(0, newRowsPerPage);
  };
  
  const fetchData = async (newPage, newRowsPerPage) => {
    setError(null);
    const payload = {
      ...filters,
      start_date: filters.start_date ? dayjs(filters.start_date).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null,
      end_date: filters.end_date ? dayjs(filters.end_date).endOf('day').format('YYYY-MM-DD HH:mm:ss') : null,
      page: newPage + 1,
      page_size: newRowsPerPage
    };
    
    setTableLoading(true);
    setLoading(true);
    try {
      const response = await baseApi.post('/get-contents', payload);
      const data = await response.json();
      if(data.error) {
        setLoading(false);
        alert(data.error);
        navigate('/');
      }
      else{
        setRecords(response.data.rows);
        setTotalRecords(response.data.total_records);
        setNo_of_contents(response.data.total_records);
        setTotalDuration(response.data.total_duration);
        console.log(response.data.total_duration);
        console.log(totalDuration);
        setTableLoading(false);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      if (error.response) {
      if (error.response.status === 503) {
        alert("Backend is not running (Service Unavailable)");
      } else {
        alert(`Error: ${error.response.data.error || 'Something went wrong!'}`);
      }
    } else if (error.request) {
      alert("Backend is not reachable. Please check if the server is running.");
    } else {
      alert(`Error: ${error.message}`);
    }
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  const calculateRecordRange = () => {
    if (totalRecords === 0) {
      return "0-0";
    }
    const start = page * rowsPerPage + 1;
    const end = Math.min((page + 1) * rowsPerPage, totalRecords);
    return `${start}-${end}`;
  };
  

  const handleDownload = async () => {
    if (validateFields()) {
      const fileName = prompt("File name:", "Report");
      if (!fileName) return;
  
      const payload = {
        ...filters,
        start_date: filters.start_date ? dayjs(filters.start_date).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null,
        end_date: filters.end_date ? dayjs(filters.end_date).endOf('day').format('YYYY-MM-DD HH:mm:ss') : null,
        file_name: fileName,
      };
  
      setLoading(true);
      console.log(`Downloading Excel with file name: ${fileName}`);
  
      try {
        const response = await baseApi.post('/generate-report', payload);
        const data = await response.json();
  
        if (data.error) {
          alert(data.error);
        } else if (data.message) {
          alert(data.message);
        } else {
          alert("Unexpected response. Please try again.");
        }

      } catch (error) {
        setLoading(false);
          if (error.response) {
          if (error.response.status === 503) {
            alert("Backend is not running (Service Unavailable)");
          } else {
            alert(`Error: ${error.response.data.error || 'Something went wrong!'}`);
          }
        } else if (error.request) {
          alert("Backend is not reachable. Please check if the server is running.");
        } else {
          alert(`Error: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    }
  };
  
  const validateFields = () => {
    let isValid = true;
    if (!filters.file_type) {
      setFileTypeError(true);
      isValid = false;
    }
    if (!filters.resolution_type) {
      setResolutionError(true);
      isValid = false;
    }
    return isValid;
  };
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    if (field === 'start_date' && filters.end_date && value.isAfter(filters.end_date)) {
      setDateError(true);
    } else if (field === 'end_date' && filters.start_date && value.isBefore(filters.start_date)) {
      setDateError(true);
    } else {
      setDateError(false);
    }
    if (field === 'file_type') {
      setFileTypeError(false);
    }
    if (field === 'resolution_type') {
      setResolutionError(false);
    }
  };
  const handleSearch = () => {
    if (validateFields()) {
      setPage(0);
      fetchData(0, rowsPerPage);
    }
  };
  
  const handleReset = () => {
    setFilters({
      status: '',
      start_date: null,
      end_date: null,
      file_ext: '',
      file_type: '',
      resolution_type: '',
    });

    reset({
      status: '',
      start_date: null,
      end_date: null,
      file_ext: '',
      file_type: '',
      resolution_type: '',
      no_of_content: '',
      totalDuration: '',
    });
    setTotalRecords(0);
    setPage(0);
    setRecords([]);
  };

  const getResolutionOptions = (serviceId) => {
    switch (serviceId) {
      case '5200':
        return [<MenuItem key="HD" value="HD">HD</MenuItem>];
      case '5001':
        return [
          <MenuItem key="FHD" value="FHD">FHD</MenuItem>,
          <MenuItem key="4K" value="4K">4K</MenuItem>
        ];
      case '5010':
      case '5028':
      case '5002':
        return [<MenuItem key="FHD" value="FHD">FHD</MenuItem>];
      default:
        return [
          <MenuItem key="SD" value="SD">SD</MenuItem>,
          <MenuItem key="FHD" value="FHD">FHD</MenuItem>,
          <MenuItem key="4K" value="4K">4K</MenuItem>
        ];
    }
  };
  
  return (
    <Box sx={{ padding: 2, backgroundColor: '#f5f5f5', minHeight: '84vh' }}>
      <LoaderBackdrop open={loading} />
      <Paper elevation={4} sx={{ marginBottom: 2, overflow: 'hidden', borderRadius: '12px' }}>
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ width: '150px', backgroundColor: theme.palette.primary.main, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }}>
              {projectName}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, padding: 6.5}}>
            <Grid2 container spacing={2}>
          <Grid2 item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth
              label={
                <span style={{fontSize: '14px'}}>
                  Status
                </span>
              }
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              select
              size="small"
              sx={{ width: '150px' }}
            >
              <MenuItem value="processing-success">Success</MenuItem>
              <MenuItem value="processing-inprogress">In-progress</MenuItem>
              <MenuItem value="processing-failed">Failed</MenuItem>
            </TextField>
          </Grid2>
          <Grid2 item xs={12} sm={6} md={2.5}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={
                  <span style={{fontSize: '14px'}}>
                    Start Date
                    <span style={{ color: 'red', fontSize: '14px' }}>*</span>
                  </span>
                }
                value={filters.start_date}
                onChange={(newValue) => handleFilterChange('start_date', newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: { width: '150px' }
                  }
                }}
              />
            </LocalizationProvider>
          </Grid2>
          <Grid2 item xs={12} sm={6} md={2.5}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={
              <span style={{fontSize: '14px'}}>
                End Date
                <span style={{ color: 'red', fontSize: '14px' }}>*</span>
              </span>
            }
            value={filters.end_date}
            onChange={(newValue) => handleFilterChange('end_date', newValue)}
            minDate={filters.start_date}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                error: dateError,
                sx: { width: '150px' },
                helperText: dateError ? 'end date cannot be before start date' : '',
              },
            }}
          />
        </LocalizationProvider>
      </Grid2>
      <Grid2 item xs={12} sm={6} md={2.5}>
                <TextField
                  fullWidth
                  label={
                    <span style={{fontSize: '14px'}}>
                      File Ext
                    </span>
                  }
                  value={filters.file_ext}
                  onChange={(e) => handleFilterChange('file_ext', e.target.value)}
                  size="small"
                  sx={{ width: '150px' }}
                />
              </Grid2>
              <Grid2 item xs={12} sm={6} md={2.5}>
                <TextField
                  fullWidth
                  label={
                    <span style={{fontSize: '14px'}}>
                      File Type
                      <span style={{ color: 'red', fontSize: '14px' }}>*</span>
                    </span>
                  }
                  value={filters.file_type}
                  onChange={(e) => handleFilterChange('file_type', e.target.value)}
                  size="small"
                  sx={{ width: '150px' }}
                  error={fileTypeError}
                  helperText={fileTypeError ? 'File type is required' : ''}
            />
          </Grid2>
          <Grid2 item xs={12} sm={6} md={2.5}>
                  <TextField
                    fullWidth
                    label={
                      <span style={{fontSize: '14px'}}>
                        Resolution
                        <span style={{ color: 'red', fontSize: '14px' }}>*</span>
                      </span>
                    }
                    value={filters.resolution_type}
                    onChange={(e) => handleFilterChange('resolution_type', e.target.value)}
                    select
                    size="small"
                    sx={{ width: '150px' }}
                    error={resolutionError}
                    helperText={resolutionError ? 'Resolution Type is required' : ''}
                  >
                    {getResolutionOptions(serviceId)}
                  </TextField>
            
          </Grid2>
        </Grid2>
        </Box>

      <Box
        sx={{
          borderLeft: '2px dashed rgba(25, 118, 210, 0.5)',
          height: 'auto',
          marginLeft: 2,
          marginRight: 2,
        }}
      />

        <Box sx={{ display: 'flex', flexDirection: 'column', padding: 2, backgroundColor: '#fff' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column'}}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1}}>
                <Typography sx={{ fontWeight: 'bold', fontSize: '17px', color: theme.palette.primary.main }}>
                  No of Contents
                </Typography>
                <Typography sx={{ marginLeft: 2, fontSize: '17px' }}>
                  {no_of_content ?? 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '17px', color: theme.palette.primary.main }}>
                Total Duration
              </Typography>
              <Typography sx={{ marginLeft: '23px', fontSize: '17px' }}>
                {totalDuration ?? 'N/A'}
              </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2, gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleReset}
                startIcon={<RefreshIcon />}
                sx={{
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderRadius: 2,
                  fontSize: '15px',
                  padding: '8px 16px',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    color: '#fff',
                  },
                }}
              >
                Reset
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                startIcon={<FontAwesomeIcon icon={faFilter} />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  fontSize: '15px',
                  padding: '8px 16px',
                  backgroundColor: theme.palette.primary.main,
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Filter
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleDownload}
                startIcon={<FileDownloadIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  fontSize: '15px',
                  padding: '8px 16px',
                  color: '#fff',
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Download Report
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
      <Paper elevation={6} sx={{ 
        padding: 2, 
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end' , marginBottom: 2 }}>
        </Box> */}
        <TableContainer sx={{ minHeight: 512 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '17px', fontWeight: 'bold' }}>Content ID</TableCell>
                <TableCell sx={{ fontSize: '17px', fontWeight: 'bold' }}>Content Title</TableCell>
                <TableCell sx={{ fontSize: '17px', fontWeight: 'bold' }}>Project Name</TableCell>
                <TableCell sx={{ fontSize: '17px', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontSize: '17px', fontWeight: 'bold' }}>Created Date</TableCell>
                <TableCell sx={{ fontSize: '17px', fontWeight: 'bold' }}>File Extension</TableCell>
                <TableCell sx={{ fontSize: '17px', fontWeight: 'bold' }}>File Type</TableCell>
                <TableCell sx={{ fontSize: '17px', fontWeight: 'bold' }}>Resolution</TableCell>
                <TableCell sx={{ fontSize: '17px', fontWeight: 'bold' }}>Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableLoading ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '300px',
                      }}
                    >
                      <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>
                        Fetching data... please wait
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '300px',
                      }}
                    >
                      <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#e63946' }}>
                        {error}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '405px',
                      }}
                    >
                      <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>
                        No records found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.content_id} hover>
                    <TableCell>{record.content_id}</TableCell>
                    <TableCell>{record.content_title}</TableCell>
                    <TableCell>{record.cp_name}</TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell>{record.created_date}</TableCell>
                    <TableCell>{record.file_ext}</TableCell>
                    <TableCell>{record.file_type}</TableCell>
                    <TableCell>{record.resolution}</TableCell>
                    <TableCell>{record.duration}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={totalRecords}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(handleChangePage)}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}