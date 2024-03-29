import React, { Component, useState } from 'react';
import api from '../services/api';
import './flashCard.css';
import TextField from '@mui/material/TextField';
import * as securedLocalStorage from "./SecureLocalaStorage";
import * as CheckAccess from "./CheckAccess";
import SnackBar from './SnackBar';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function FileUpload() {

	// const serverUrl = `http://localhost:8080/files/`
	const serverUrl = securedLocalStorage.baseUrl + 'files/'
	const [selectedFile, setSelectedFile] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [list, setList] = useState([]);
	const [showTable, setShowTable] = useState(true);
	const [selectedSubject, setSelectedSubject] = useState("");
	const [title, setTitle] = useState("");
	const [readAndWriteAccess, setReadAndWriteAccess] = React.useState(false);
	const sample = {
		type: "pdf",
		list: []
	}
	const [openSnackBar, setOpenSnackBar] = React.useState(false);
	const [snackBarData, setSnackBarData] = React.useState();
	const [selectedSubjects, setSelectedSubjects] = useState(sample);
	React.useEffect(() => {
		async function fetchData() {
			const subData = await api(null, serverUrl + 'get/subjects', 'get');

			if (subData.status === 200) {
				setSelectedSubject(subData.data[0].id)
				setSubjects(subData.data)
			}
			const listData = await api(null, serverUrl + 'get/file/list', 'get');

			if (listData.status === 200) {
				setList(listData.data)
			}

		}
		fetchData();
	}, []);

	React.useEffect(() => {
		const currentScreen = (window.location.pathname.slice(1)).replace(/%20/g, ' ');
		if (CheckAccess.checkAccess(currentScreen, 'read') && CheckAccess.checkAccess(currentScreen, 'write')) {
			setReadAndWriteAccess(true);
		}
	}, [])
	// On file select (from the pop up)
	const onFileChange = event => {

		setSelectedFile(event.target.files);

	};

	// On file upload (click the upload button)
	const onFileUpload = async () => {

		// Create an object of formData
		if (!title) {
			alert("please enter title");
		} else
			if (selectedFile?.length > 0) {
				const formData = new FormData();

				for (let i = 0; i < selectedFile?.length; i++) {
					formData.append(
						"files", selectedFile[i],
					);
				}
				formData.append('selectedSubject',
					selectedSubject)
				formData.append('title',
					title)
				const data = await api(formData, serverUrl + 'upload', 'post');
				if (data.status === 200) {
					const data = await api(null, serverUrl + 'get/subjects', 'get');
					const listData = await api(null, serverUrl + 'get/file/list', 'get');

					if (listData.status === 200) {
						setList(listData.data)
					}
					if (data.status === 200) {
						setSelectedSubject(data.data[0].id)
						setSubjects(data.data)
						setTitle("");
					}
					alert('File uploaded!')
					setSelectedFile([])
					setShowTable(true);
				}
			} else {
				alert('Please choose file to uplad!')
			}
	};
	const fileData = () => {

		return (
			<div>
				<br />
				<h4>Choose before the Upload</h4>
			</div>
		);

	};

	function selectedList(row) {
		let val = 0;
		if (row.is_home_ref === 0) {
			val = 1;
		}
		var foundIndex = list.findIndex(x => x.id == row.id);
		list[foundIndex].is_home_ref = val;
		setList([...list]);
		const index = selectedSubjects.list.findIndex(x => x.id == row.id);
		if (index === -1) {
			selectedSubjects.list.push({ id: row.id, value: val })
		}
		else {
			selectedSubjects.list[index].value = val;
		}
		setSelectedSubjects(selectedSubjects);
	}

	const addToHome = async () => {
		const data = await api(selectedSubjects, securedLocalStorage.baseUrl + 'common/ref', 'post');
		if (data.status === 200) {
			setSelectedSubjects(sample);
			setOpenSnackBar(true);
			const data = {
				type: "success",
				message: "Added to home successfully!.."
			}
			setSnackBarData(data);
		}
		else {
			setOpenSnackBar(true);
			const data = {
				type: "success",
				message: "Adding home failed!..."
			}
			setSnackBarData(data);

		}
	}

	function closeSnakBar() {
		setOpenSnackBar(false)
	}

	return (
		<div>
			{showTable && <div style={{ width: "60%", textAlign: "right", paddingBottom: '2rem' }}>
				<button disabled={!readAndWriteAccess} style={{ height: '2rem' }} onClick={() => addToHome()}>Add to home </button> &nbsp;
				<button style={{ height: '2rem' }} disabled={!readAndWriteAccess} onClick={() => setShowTable(false)}>Upload new Document</button>
			</div>}
			{showTable && <table>
				<tr>
					<th>Select</th>
					<th>S.No.</th>
					<th>Subject</th>
					<th>Url</th>
				</tr>
				{list?.map((c, i) => {
					return (<tr>
						<td>
							<FormControlLabel
								control={
									<Checkbox
										checked={c.is_home_ref}
										disabled={!readAndWriteAccess}
										onChange={(e) => selectedList(c)}
									/>
								}
							/>
						</td>
						<td>{i + 1}</td>
						<td>{c.name}</td>
						<td>{c.location_url}</td>
					</tr>)
				})
				}

			</table>}
			{!showTable &&
				<div style={{ paddingTop: '2rem', textAlign: 'center' }}>

					<div>
						<select disabled={!readAndWriteAccess} onChange={(e) => { setSelectedSubject(e.target.value) }}>
							{subjects.map(s => {
								return <option value={s.id}>{s.name}</option>
							})}</select>
						<br />
						<br />
						<TextField
							label="Title"
							id="outlined-start-adornment"
							sx={{ width: '20%' }}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							name="Title"
							disabled={!readAndWriteAccess}
						// error={title === ""}
						// helperText={title === "" ? 'Title is reuired' : ' '}
						/>
					</div>
					<div style={{ paddingTop: '2rem' }}>
						<input disabled={!readAndWriteAccess} type="file" multiple onChange={onFileChange} />
						<br />
						<br />
						<button onClick={onFileUpload}>
							Upload
						</button>
					</div>
					{fileData()}
				</div>
			}
			{openSnackBar &&
				<SnackBar data={snackBarData} closeSnakBar={closeSnakBar} />
			}
		</div>
	);
}

