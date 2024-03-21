import * as React from 'react'
import { useState } from 'react';
import CheckboxTree from 'react-dynamic-checkbox-tree';
import api from '../services/api';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
/**
 *
 * @returns table data
 */

import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import TableHead from '@mui/material/TableHead';
import * as securedLocalStorage from "./SecureLocalaStorage";
import * as CheckAccess from "./CheckAccess";
import Loader from './Loader';

function TablePaginationActions(props) {
    const [readAndWriteAccess, setReadAndWriteAccess] = React.useState(false);
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    React.useEffect(() => {
        const currentScreen = (window.location.pathname.slice(1)).replace(/%20/g, ' ');
        if (CheckAccess.checkAccess(currentScreen, 'read') && CheckAccess.checkAccess(currentScreen, 'write')) {
            setReadAndWriteAccess(true);
        }
    }, []);


    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0 && !readAndWriteAccess}
                aria-label="first page"
            >
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0 && !readAndWriteAccess}
                aria-label="previous page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1 && !readAndWriteAccess}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1 && !readAndWriteAccess}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
}

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};

export default function QuestionCreationFromPairs() {
    // const serverUrl = `http://localhost:8080/question/`
    const serverUrl = securedLocalStorage.baseUrl + 'question/'
    const [checked, setChecked] = useState([]);
    const [catagoryData, setCategoryData] = useState([]);
    const [pairsData, setPairsData] = useState([]);
    const [allCheckBoxValue, setAllCheckBoxValue] = useState(false);
    const [generatedData, setGeneratedData] = useState([]);
    const [showContent, setShowContent] = useState(true);
    const [readAndWriteAccess, setReadAndWriteAccess] = React.useState(false);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [showLoader , setShowLoader] = React.useState(false)
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    React.useEffect(() => {
        async function fetchData() {
            // You can await here
             setShowLoader(true)
            const catData = await api(null, securedLocalStorage.categoriesUrl, 'get');
            const pairsData = await api({ catIds: checked }, serverUrl + 'get/pairs', 'post');
            if (catData.status === 200) {
                setCategoryData(catData.data);
            }
            if (pairsData.status === 200) {
                setPairsData(pairsData.data);
            }
            setShowLoader(false)
        }
        fetchData();
    }, []);

    React.useEffect(() => {
        const currentScreen = (window.location.pathname.slice(1)).replace(/%20/g, ' ');
        if (CheckAccess.checkAccess(currentScreen, 'read') && CheckAccess.checkAccess(currentScreen, 'write')) {
            setReadAndWriteAccess(true);
        }
    }, []);
    // const renderPairsData = () => {
    //     return (<div>
    //         {pairsData?.map((qData, i) => {
    //             return (
    //                 <div style={{ padding: '5px' }}>

    //                     <div style={{ display: 'flex' }}>
    //                         <div>
    //                             <span>{qData.q_id}.</span>
    //                             <input disabled={!readAndWriteAccess} checked={qData.checked} onClick={() => onClickCheckBox(qData.q_id, i)} type="checkbox" /></div>
    //                         <div style={{
    //                             paddingTop: '5px',
    //                             border: '1px solid blue'
    //                         }}>

    //                             <span>Question: {qData.question}</span> <br />
    //                             <span>Answer: {qData.answer}</span>
    //                         </div>
    //                     </div>
    //                 </div>)
    //         })
    //         }
    //     </div>)
    // } /


    const renderPairsData = () => {
        return (
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
                    <TableHead>
                        <TableRow>
                        <TableCell>S.No</TableCell>
                            <TableCell align="center">
                                Action
                            </TableCell>
                            <TableCell align="center">Question</TableCell>
                            <TableCell align="center">Answer</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {(rowsPerPage > 0
                                ? pairsData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : pairsData
                            ).map((row, i) => (
                            <TableRow key={i}>
                                      <TableCell component="th" scope="row">
                                        {/* {i + 1} */}
                                        {(page * rowsPerPage) + i + 1}
                                    </TableCell> 
                                <TableCell component="th" scope="row">
                                        <input disabled={!readAndWriteAccess} checked={row.checked} onClick={() => onClickCheckBox(i)} type="checkbox" />
                                </TableCell>
                                <TableCell>{row.question}</TableCell>
                                <TableCell>{row.answer}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50, 100, { label: 'All', value: -1 }]}
                                colSpan={5}
                                count={pairsData.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                SelectProps={{
                                    inputProps: {
                                        'aria-label': 'questionData per page',
                                    },
                                    native: true,
                                }}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                ActionsComponent={TablePaginationActions}
                                disabled={!readAndWriteAccess}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        );
    };
    

    React.useEffect(() => {
        async function fetchData() {
            setShowLoader(true)
            const pairsData = await api({ catIds: checked }, serverUrl + 'get/pairs', 'post');

            if (pairsData.status === 200) {
                setPairsData(pairsData.data);
            }
            setShowLoader(false )
        }
        fetchData();
    }, [checked]);
    const createQuestions = async () => {
        const qList = generatedData.filter(g => g.checked);
        const response = await api({ list: qList }, serverUrl + 'create/questions/pairs', 'post');
        if (response.status === 200) {
            const pairsData = await api({ catIds: checked }, serverUrl + 'get/pairs', 'post');

            if (pairsData.status === 200) {
                setPairsData(pairsData.data);
            }
            setGeneratedData([]);
            setShowContent(true);
            alert('Question Created successfully!');
        }
    }
    const generateQuestions = async () => {
        setShowLoader(true)

        const ids = pairsData.filter(p => p.checked)?.map(pp => pp.pair_id);
        const response = await api({ pairids: ids }, serverUrl + 'generate/questions', 'post');

        if (response.status === 200) {
            setShowContent(false);
            setGeneratedData(response.data);
        }
        setShowLoader(false)
    }
//

    const onClickCheckBox = (i) => {
        const globalIndex = page * rowsPerPage + i;
        console.log(globalIndex, 'globalIndex');
        setPairsData((prevQuestionData) => {
            const updatedPairsData = prevQuestionData.map((pair, pairIndex) => {
                if (pairIndex === globalIndex) {
                    return {
                        ...pair,
                        checked: !pair.checked
                    };
                }
                return pair;
            });
            return updatedPairsData;
        });
    };
    
    ///
        
    const onClickCheckBoxQuestion = (id, index) => {
        if (id && index >= 0) {
            setAllCheckBoxValue(false);
            generatedData[index]['checked'] = !generatedData[index]['checked'];
        } else {
            setAllCheckBoxValue(!allCheckBoxValue)
            generatedData.map(q => q.checked = !allCheckBoxValue)
        }
        setGeneratedData(generatedData);
        console.log(generatedData, 'generated data');
    }
    // //delete row of paired generatedData
    // const deleteGeneratedData = async () => {
    //     try {
    //         const selectedRows = generatedData.filter((row) => row.checked);
    
    //         if (selectedRows.length === 0) {
    //             alert('Please select rows to delete.');
    //             return;
    //         }  
    //         const id = selectedRows.map((row) => row.id);
    //         // const response = await api(null, `${serverUrl}delete/generatedData`, 'delete', { ids: idsToDelete });
    //         const response = await api(null, serverUrl + 'delete/generatedData/' + id, 'delete');
    //         if (response.status === 200) {
    //             const updatedGeneratedData = generatedData.filter((row) => !row.checked);
    //             setGeneratedData(updatedGeneratedData);
    //             alert('Selected rows deleted successfully!');
    //         } else {
    //             alert('Failed to delete selected rows. Please try again.');
    //         }
    //     } catch (error) {
    //         console.error('Error deleting rows:', error);
    //         alert('An error occurred while deleting the rows. Please try again.');
    //     }
    // };
    const deleteGeneratedData = async (id) => {
        try {
            const response = await api(null, serverUrl + 'delete/generatedData/' + id, 'delete');
            console.log(response , 'response');
            if (response.status === 200) {
                const updatedGeneratedData = generatedData.filter((row) => row.id !== id);
                setGeneratedData(updatedGeneratedData);
                alert('Selected row deleted successfully!');
            } else {
                alert('Failed to delete the row. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting row:', error);
            alert('An error occurred while deleting the row. Please try again.');
        }
    };

const onClose = () =>{
    setShowContent(true);
    setGeneratedData('');
}

    
    const renderGeneratedData = () => {
        return (
            <div>
            <Button variant="contained" color="primary" onClick={onClose}>
                Close
            </Button>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center"><span>
                                    <input checked={allCheckBoxValue} value={allCheckBoxValue} onClick={() => onClickCheckBoxQuestion()} type="checkbox" />
                                </span></TableCell>
                                <TableCell align="center">Question Title</TableCell>
                                <TableCell align="center">PART A</TableCell>
                                <TableCell align="right">PART B</TableCell>
                                <TableCell align="right">Delete</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(rowsPerPage > 0
                                ? generatedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : generatedData
                            ).map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell component="th" scope="row">
                                        <span>
                                            <input checked={row.checked} value={row.checked} onClick={() => onClickCheckBoxQuestion(row.id, i)} type="checkbox" />
                                        </span>
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        Match the following
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        {row.part_a?.map((a, i) => { return (<><div>{i + 1}{')'}.<span>{a}</span></div><br /></>) })}
                                    </TableCell>
                                    <TableCell style={{ width: 160 }} align="right">
                                        {row.part_b?.map((b, i) => { return (<><div>{i + 1}{')'}.<span>{b}</span></div><br /></>) })}
                                    </TableCell>
                                    <TableCell align="right">
                                   <Button
                                    variant="outlined"
                                      disabled={!readAndWriteAccess}
                                     onClick={() => deleteGeneratedData(row.id)}
                                       >
                                      Delete
                                      </Button>
                                     </TableCell>
                                </TableRow>
                            ))}


                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    rowsPerPageOptions={[10, 25, 50, 100, { label: 'All', value: -1 }]}
                                    colSpan={5}
                                    count={generatedData.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    SelectProps={{
                                        inputProps: {
                                            'aria-label': 'questionData per page',
                                        },
                                        native: true,
                                    }}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    ActionsComponent={TablePaginationActions}
                                    disabled={!readAndWriteAccess}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </div>
        )
    }
    return (
        <>
        <div>
            {<div>
                <div style={{ float: 'right' }}>
                    <Stack spacing={2} direction="row">
                        {showContent && (generatedData.length === 0) && <Button disabled={!readAndWriteAccess} variant="contained" onClick={() => generateQuestions()}>Generate Questions</Button>}
                        {!showContent && (generatedData.length > 0) && <Button disabled={!readAndWriteAccess} variant="contained" onClick={() => createQuestions()}>Create Questions</Button>}

                    </Stack>
                </div>
                {!showContent && <div style={{ height: '30rem', overflow: 'auto', width: '65%', float: 'left', paddingLeft: '5%', marginTop: '5%' }}>
                    {generatedData && generatedData.length > 0 && renderGeneratedData()}
                </div>}
                {showContent && <div style={{ height: '30rem', overflow: 'auto', width: '75%', float: 'left', paddingLeft: '5%', marginTop: '5%' }}>
                    {pairsData && pairsData.length > 0 && renderPairsData()}
                </div>}
                <div style={{ height: '30rem', width: '20%', float: 'right', paddingRight: '5%', overflow: 'auto', paddingTop: '5%' }}>
                    {showContent && catagoryData?.length > 0 && <CheckboxTree
                        nodes={catagoryData}
                        checked={checked}
                        onCheck={checked => setChecked(checked)}
                        disabled={!readAndWriteAccess}
                    //   onClick={(e) => onClickCheckBox(e)}
                    />}
                </div>

            </div>}
            {showLoader && <Loader />}

            </div>
        </>
    )
}