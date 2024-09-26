export default {
	main: async()=>{
		//------------------ QUERY run ------------------------------//
		try{
			await this.createPDF()
		}catch(error){
			showAlert(error,"error")
		}
	},

	representativeInfo:async()=>{
		await list_of_agency_accounts.run()
		const data = list_of_agency_accounts.data;

		if (data === undefined){
			await list_of_agency_accounts.run()
		}
		for (const agency of data) {
			if (agency.is_representative === true) {
				const last_name = agency.last_name ? agency.last_name : "";
				const full_name = `${last_name} ${agency.first_name}`;
				const department = agency.department ? agency.department : "";
				return { fullName: full_name, department: department };
			}
		}
		const first_name = appsmith.store.user.first_name
		const last_name = appsmith.store.user.last_name
		const full_name = last_name + first_name
		const department = appsmith.store.user.department
		return { fullName: full_name, department: department };
	},


	createPDF: async () => {
		////------------------ Data + Query ------------------////
		const gtnSign = 'https://scontent.fdad2-1.fna.fbcdn.net/v/t1.15752-9/415563709_381918244355199_5381862728633477902_n.png?_nc_cat=108&ccb=1-7&_nc_sid=8cd0a2&_nc_eui2=AeGWNMWCTaMvzxrLXX0f2pAph7OG-4HjIwuHs4b7geMjCyfKWcY3LwRPnzKrDS8DH6G9tNBoLjQeVDKPbk6kwEBL&_nc_ohc=kPv8oloNLrAAX-4NerV&_nc_ht=scontent.fdad2-1.fna&oh=03_AdQAEBBWcwt0gVAxXt-uEzQLSDyps4bOj1mwYl482g5I4w&oe=65CDA149'
		// 
		const gtnLogo ='https://scontent.fdad2-1.fna.fbcdn.net/v/t1.15752-9/413236334_908234960971208_5016760532102606811_n.png?_nc_cat=101&ccb=1-7&_nc_sid=8cd0a2&_nc_eui2=AeEL2gdWMZRHwLsC8jjmIoa4Vgym2MwnqwZWDKbYzCerBvZBJwZ_B3N9qxL20khCCUF8WxDgsZ8VMA9Dw-i1jAE-&_nc_ohc=Z03BaOPm49oAX8N7ngh&_nc_ht=scontent.fdad2-1.fna&oh=03_AdQrjC8xmPLgLRBUTwOqWmIAuBe93MD2JKRbAAszykuKeA&oe=65CDA690'

		try {
			await get_agency_info.run().catch((e) => showAlert('cannot get agency info'+e.message,'error'))
			const agencyInfo = get_agency_info.data
			const isHasBankInfo = agencyInfo[0].bank_name !== null

			const userInfo = appsmith.store.user
			const representativeInfo = await this.representativeInfo()
			const invoiceDate = await this.lastDayOfMonth(year_month_treeselect.selectedOptionValue)
			//---------------- Text Attribute--------------//
			const textHeader = 16;
			const textTitle = 14;
			const textNormal = 10;
			const textSmall =8;
			const lingSpacing = 1.6
			const textBlack =  PDFLib.rgb(0, 0, 0)
			const textGray = PDFLib.rgb(0.3, 0.3, 0.3);
			const textRed = PDFLib.rgb(1, 0.3, 0.3)
			const tableThickness = 0.1
			const tableBorderColor = PDFLib.rgb(0.4, 0.4, 0.3)
			const headerBgColor =PDFLib.rgb(0.7, 0.7, 0.7)

			////----------------- Text Info ----------------////
			//---------------Table text data ------------//
			const data =await this.tableArrayData()
			const tableRows =data['tableRows']
			const amountWithoutTax= data['totalAmount']
			const amountWithTax= amountWithoutTax + amountWithoutTax/100 * 10;
			const taxAmount = Math.round((amountWithoutTax / 100) * 10);

			//----------------- Static Text ----------------//
			const pdfTittle = '契約報告書'
			const customerCompany= agencyInfo[0].name
			const customerNumber =agencyInfo[0].invoice_number ? `登録番号：${agencyInfo[0].invoice_number}` : ""
			// const customerDepartment= userInfo.department ? userInfo.department +"　部" : ""
			// const customerName= userInfo.first_name ? userInfo.last_name + userInfo.first_name :""
			const customerDepartment= representativeInfo.department
			const customerName= representativeInfo.fullName

			// const customerDepartment= 'asd'
			// const customerName= 'name'

			const customerInfo= `${customerCompany} \n${customerNumber} \n${customerDepartment} \n${customerName}　様 `
			const customerPayDate = invoiceDate.paymenDate 

			const bankTypeMap = {
				'savings': '普通',
				'checking': '当座',
				'deposit':'定期'
			};
			const bankMissingMessage= 'このフィールドは必須です。即座に情報を更新してください。'
			const customerBankName = agencyInfo[0].bank_name != null ? agencyInfo[0].bank_name : "";
			const customerBankBranch = agencyInfo[0].branch !=null ? agencyInfo[0].branch : ""
			const customerBankType = agencyInfo[0].classification ? bankTypeMap[agencyInfo[0].classification] : "";
			const customerBankNumber = agencyInfo[0].account_number || "";
			const customerBankAccountName = agencyInfo[0].account_name || "";

			const gtnInvoiceDate= invoiceDate.invoiceDate 
			const gtnNumber = 'T412312312321'
			const gtnInfo = `該当期間:  ${gtnInvoiceDate} 分 \n株式会社グローバルトラストネットワークス \n登録番号：${gtnNumber}`
			const gtnAddress = `〒170-0013 \n東京都豊島区東池袋1-21-11 オーク池袋ビル2階 \nTEL：03-6804-6801　FAX：03-6804-6802 `

			const paymentInfo = `${customerBankName}　${customerBankBranch}　${customerBankType} ${customerBankNumber} \n${customerBankAccountName} \n※送付後5日以内に誤りのある旨の連絡がない場合は、\n記載内容の通り確認があったものとする。`

			////--------------- FONT set ---------------//
			const pdfDoc = await PDFLib.PDFDocument.create();
			const regularFrontUrl = '//fonts.gstatic.com/ea/mplus1p/v1/Mplus1p-Regular.ttf'
			const ragularFontBytes = await fetch(regularFrontUrl).then(res => res.arrayBuffer())
			pdfDoc.registerFontkit(fontkit)
			const fontRegular = await pdfDoc.embedFont(ragularFontBytes)

			const boldFrontUrl = '//fonts.gstatic.com/ea/mplus1p/v1/Mplus1p-Medium.ttf'
			const boldFontBytes = await fetch(boldFrontUrl).then(res => res.arrayBuffer())
			pdfDoc.registerFontkit(fontkit)
			const fontBold = await pdfDoc.embedFont(boldFontBytes)

			//-------------PAGE dimenssion ------------//
			const page = pdfDoc.addPage()
			const pageSize = page.getSize(); // { width, height }
			const pageWidth = pageSize.width;  //595
			const pageHeight = pageSize.height; //841
			const pageMarginX = 20;
			const pageMarginY = 30
			const textSize = 16

			////-------------TOP LEFT TITLE - CUSTOMER info - payment invoice ---------- ////
			const headerRectWidth = 220;
			const headerRectHeight = 30;
			page.drawRectangle({
				x:pageMarginX , y: pageHeight - pageMarginY-10, width: headerRectWidth, 
				height: headerRectHeight, color: PDFLib.rgb(0.75, 0.75, 0.75), 
			});
			//------- PDF title text - center text----------//
			page.drawText(pdfTittle, {
				x: pageMarginX + (headerRectWidth ) / 2 - 40 ,
				y: pageHeight - pageMarginY,
				size: textHeader, font: fontRegular, color: textBlack })
			//--------- CUSTOMER information ------//
			this.drawMutiLineText(page, customerInfo, pageMarginX ,
														pageHeight - pageMarginY-20 -5,
														textNormal, fontRegular, textGray, lingSpacing);

			page.drawText('下記の通りご案内申し上げます。', {
				x:  pageMarginX, y: pageHeight -125,
				size: textSmall, font: fontRegular, color: textGray
			})
			page.drawText(`ご紹介手数料 :  ¥ ${amountWithTax.toLocaleString()}      (税込) `, {
				x:   pageMarginX + (headerRectWidth ) / 2 - 90 , y: pageHeight - 142,
				size: textNormal, font: fontBold, color: textBlack
			})

			//-----------Draw line ------------//
			page.drawLine({
				start: { x: pageMarginX, y: pageHeight-147 },
				end: { x: pageMarginX + headerRectWidth, y: pageHeight-147 },
				thickness: 1, color: PDFLib.rgb(0, 0, 0) // Màu đen cho đường kẻ
			});

			//------------Draw 支払い予定日 ---------//
			page.drawText(`お支払い予定日: ¥ ${customerPayDate}            `, {
				x:   pageMarginX + (headerRectWidth ) / 2 - 90 , y: pageHeight - 160,
				size: textNormal, font: fontRegular, color: textGray
			})

			////-------------TOP RIGHT TITLE - GTN info ---------- ////
			this.drawMutiLineText(page, gtnInfo, 380 , pageHeight - 20,
														textNormal, fontRegular, textGray, 1.8);
			this.drawMutiLineText(page, gtnAddress, 380 , pageHeight - 70,
														6, fontRegular, textGray, 1.8);

			//------- TOP RIGHT LOGO AND GTN SIGN -----------//
			const gtnSignBytes = await fetch(gtnSign).then((res) => res.arrayBuffer())
			const gtnSignImage = await pdfDoc.embedPng(gtnSignBytes)
			const gtnSignScale = gtnSignImage.scale(0.4)
			page.drawImage(gtnSignImage, {
				x: pageWidth - pageMarginX -gtnSignScale.width +10 ,y: pageHeight - 97,
				width: gtnSignScale.width, height: gtnSignScale.height })
			const gtnLogoBytes = await fetch(gtnLogo).then((res) => res.arrayBuffer())
			const gtnLogoImage = await pdfDoc.embedPng(gtnLogoBytes)
			const gtnLogoScale = gtnLogoImage.scale(0.4)
			page.drawImage(gtnLogoImage, { 
				x: 420 ,y: pageHeight - 159,
				width: gtnLogoScale.width, height: gtnLogoScale.height })

			//---------------- TABLE -------------------//
			page.drawText('請求明細', {
				x:  pageMarginX, y: pageHeight -180,
				size: textNormal, font: fontBold, color: textBlack
			})

			//------------------------------------------------------//
			//----------------------- TOP TABLE ------------------------------//

			const cellWidth= 69
			const tableTopY = pageHeight -187;
			const rowHeight = 14;
			const columnWidths = [216, cellWidth , cellWidth,cellWidth,cellWidth,cellWidth];
			const numberOfRows = 41;
			const numberOfColumns = columnWidths.length;
			// const tableRowss = [
			// ['物件名', 'お申込日', '開通日','支払区分','ご紹介手数料','参考'],
			// ['クロスレジデンス白金高輪1305クロスレジデンス白金クロスレジデンス白金白', '2023年10月24日',
			// '2023年11月1日 ', '電気ガス','2,500',''],
			// ];

			// Draw table grid
			for (let i = 0; i <= numberOfRows; i++) {
				const startY = tableTopY - i * rowHeight;
				page.drawLine({ start: { x: pageMarginX, y: startY }, end: { x: pageMarginX + columnWidths.reduce((a, b) => a + b, 0), y: startY }, color: tableBorderColor, thickness: tableThickness });
			}
			for (let i = 0; i <= numberOfColumns; i++) {
				const startX = pageMarginX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
				page.drawLine({ start: { x: startX, y: tableTopY }, end: { x: startX, y: tableTopY - numberOfRows * rowHeight }, color: tableBorderColor, thickness: tableThickness});
			}

			// Background color for header
			page.drawRectangle({ x: pageMarginX, y: tableTopY - rowHeight, width: columnWidths.reduce((a, b) => a + b, 0), height: rowHeight, color:headerBgColor });

			// Redraw the bottom line of the header
			page.drawLine({
				start: { x: pageMarginX, y: tableTopY - rowHeight },
				end: { x: pageMarginX  + columnWidths.reduce((a, b) => a + b, 0), y: tableTopY - rowHeight },
				color: tableBorderColor,
				thickness: tableThickness,
			});

			// Redraw the vertical lines of the header
			page.drawLine({
				start: { x: pageMarginX, y: tableTopY },
				end: { x: pageMarginX, y: tableTopY - rowHeight },
				color: tableBorderColor,
				thickness: tableThickness,
			});
			for (let i = 0; i < numberOfColumns; i++) {
				const startX = pageMarginX + columnWidths.slice(0, i + 1).reduce((a, b) => a + b, 0);
				page.drawLine({
					start: { x: startX, y: tableTopY },
					end: { x: startX, y: tableTopY - rowHeight },
					color: tableBorderColor,
					thickness: tableThickness,
				});
			}
			console.log(tableRows)
			//------------- Draw table text -----------//
			tableRows.forEach((row, rowIndex) => {
				const y = tableTopY - (rowIndex + 1) * rowHeight + 5;
				row.forEach((cell, cellIndex) => {
					const x = pageMarginX + columnWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0) ;
					page.drawText(cell , { x: x +5, y: y, size: 7, font: fontRegular, color: textBlack });
				});
			});

			//------------ DRAW 3 BOTTOM ROW -----------//
			const bottomTableTopY = 81;
			const bottoTableStartX = 374;
			const bottomRowHeight = 18;
			const bottomColumnWidths = [cellWidth, cellWidth, cellWidth];
			const bottomNumberOfRows = 3;
			const bottomNumberOfColumns = bottomColumnWidths.length;
			const bottomTableRows = [
				["小計（税抜）", "10％対象", `    ¥ ${amountWithoutTax.toLocaleString()}` ],
				["消費税", "10％対象", `    ¥ ${taxAmount.toLocaleString()}`],
				["合計金額（税込)", "", `    ¥ ${amountWithTax.toLocaleString()}`],
			];

			// Draw table grid (lines for rows and columns)
			for (let i = 0; i <= bottomNumberOfRows; i++) {
				const startY = bottomTableTopY - i * bottomRowHeight;
				const endY = startY;
				const startX = bottoTableStartX;
				const endX = startX + bottomColumnWidths.reduce((a, b) => a + b, 0);

				page.drawLine({
					start: { x: startX, y: startY },
					end: { x: endX, y: endY },
					color: tableBorderColor,
					thickness: tableThickness,
				});
			}

			for (let i = 0; i <= bottomNumberOfColumns; i++) {
				const startX = bottoTableStartX + bottomColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
				const endX = startX;
				const startY = bottomTableTopY;
				const endY = bottomTableTopY - bottomNumberOfRows * bottomRowHeight;

				page.drawLine({
					start: { x: startX, y: startY },
					end: { x: endX, y: endY },
					color:tableBorderColor,
					thickness: tableThickness,
				});
			}

			// Draw table content
			bottomTableRows.forEach((row, rowIndex) => {
				const y = bottomTableTopY - (rowIndex + 1) * bottomRowHeight + 5; // Adjust text position within cell
				row.forEach((cell, cellIndex) => {
					page.drawText(cell, {
						x: bottoTableStartX +3+ cellIndex * bottomColumnWidths[cellIndex], // Adjust text position within cell
						y: y,
						size: textSmall,
						font: fontBold,
						color: PDFLib.rgb(0, 0, 0),
					});
				});
			});

			//-----------------DRAW PAYMENT INFO -------------//
			page.drawText('【お振込み先】', {
				x: pageMarginX -2 ,
				y: bottomTableTopY - 12,
				size: textNormal, font: fontBold, color: textBlack })

			if (isHasBankInfo){
				this.drawMutiLineText(page, paymentInfo, pageMarginX , bottomTableTopY - 25,
															7, fontRegular, textGray, 1.2);
			}
			else {
				page.drawText(bankMissingMessage, {
					x: pageMarginX -2 ,
					y: bottomTableTopY - 25,
					size: 8, font: fontBold, color: textRed })
			}

			// Save and create Blob
			const pdfBytes = await pdfDoc.save();
			const blob = new Blob([pdfBytes], { type: 'application/pdf' });
			const urll = URL.createObjectURL(blob);
			const fileName = `[${customerCompany}] ${gtnInvoiceDate}分アフィリエイト手数料報告書.pdf`
			await download(urll, fileName, "application/pdf")
				.then(showAlert(messages.Success.DOWNLOAD_SUCCESS, 'success'))
				.catch(e=>{showAlert(messages.Error.COMMON_ERROR+'\nError'+e.message,'error')});
			if( isHasBankInfo === false){
				showAlert(messages.Warning.PAYMENT_INVALID, 'warning')
			}
		} catch (error) {
			console.error('Error creating PDF:', error);
		}
	},

	//----------- DRAW MULTI LINE TEXT FUNCTION--------------//
	drawMutiLineText :(page, text, xValue, yValue, textSize, fontName, textColor, lineSpacing)=> {
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			page.drawText(line, {
				x: xValue,
				y: yValue - index * textSize * lineSpacing, 
				size: textSize,
				font: fontName,
				color: textColor
			});
		});
	},

	tableArrayData: async () => {
		try{
			// await get_table_data.run();
			const  billingData=await get_billing_by_month.data[0]
			console.log('billing', billingData.amount)
			const jsonData = get_table_data.data;
			const jsonDataLength = jsonData.length
			if (jsonDataLength >40 ){
				return showAlert("こちらからダウンロードできません。GTNに連絡してください。",'error')
			}
			const headers = [
				'  物件名',
				'     お申込日',
				'        開通日',
				'     支払区分',
				'   ご紹介手数料',
				'         参考'
			];
			// Tạo mảng chứa dữ liệu
			const tableRows = [headers];
			// let totalAmount = 0; 
			const totalAmount=   billingData.amount

			jsonData.forEach(item => {
				const proppertyName = `${item.building} ${item.room_number}`
				console.log('property', proppertyName, proppertyName.length)
				const slicedName= 	proppertyName.length > 29 ? proppertyName.slice(0,29) +' ...' : proppertyName;
				const row = [
					slicedName,
					item.created_at,
					item.start_date,
					"         "+item.modified_utility_type_code,
					"         ¥"+item.comission_fee.toLocaleString(),
					''
				];
				tableRows.push(row);
				// totalAmount += +item.comission_fee;
			});
			return { tableRows, totalAmount }; 
		}catch(error){
			showAlert("Some thing wrong.\n"+error.message,'error')
		}
	},

	dataOfTreeSelect : async ()=>{
		let treeData = [];
		let yearsMap = {};
		const responseData= await get_months_have_billing.run()
		.catch((e) => showAlert(' fail to get months have billing'+e.message,'error'))
		// const responseData= query.data
		responseData.forEach(record => {
			if (!yearsMap[record.year]) {
				yearsMap[record.year] = {
					label: record.year.toString(),
					value: record.year.toString(),
					children: []
				};
				treeData.push(yearsMap[record.year]);
			}
			yearsMap[record.year].children.push({
				label: record.month,
				value: record.month
			});
		});
		return treeData;
	},

	lastDayOfMonth :(yearMonth) =>{
		// const yearMonth = '2024-02'
		const date = new Date(yearMonth)
		const inputtedMonth = date.getMonth() +1
		const inputtedYear = date.getFullYear()

		const invoiceDate= inputtedYear +'年' + inputtedMonth+'月'
		const nextMonth = inputtedMonth +1
		let nextMonthDate= 0
		if (inputtedMonth === 11)
		{
			nextMonthDate= inputtedYear +'年'+nextMonth+'月28日'
		}
		else if(inputtedMonth===12) {
			const nextYear= inputtedYear +1
			nextMonthDate= nextYear +'年 '+'01月'+'31日'
		}
		else {
			const newYearMonth = inputtedYear+'-'+nextMonth
			const newDate = new Date(newYearMonth)
			const lastDate = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
			nextMonthDate= inputtedYear +'年'+nextMonth+'月'+lastDate+'日'
		}

		return {'invoiceDate':invoiceDate,
						'paymenDate':nextMonthDate}
	},

	//test
	test: async()=>{
		return await 	get_agency_info.run()
			.then(await get_table_data.run())
			.catch((e) => showAlert(e, 'error'))
	},

}
