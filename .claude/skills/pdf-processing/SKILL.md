---
name: pdf-processing
description: Extract text and table data from pdf. Good for pdf analysis when user requires.
---
## step1: check if the file is a pdf
- role: user
  content: |
    I have a file at the path: {file_path}. Please check if it is a PDF file.

## step2: extract text from the pdf
- role: user
  content: |
    Please extract the text content from the PDF file located at: {file_path}.

## step3: extract tables from the pdf
- role: user
  content: |
    Please extract any tables present in the PDF file located at: {file_path} and provide them in a structured format (e.g., CSV or JSON).

## step4: summarize the extracted text
- role: user
  content: |
    Please provide a summary of the text extracted from the PDF file located at: {file_path}.

## step5: analyze the extracted tables
- role: user
  content: |
    Please analyze the tables extracted from the PDF file located at: {file_path} and provide insights or key findings.

## export the extracted data report
- role: user
  content: |
    Please compile a report of the extracted text and tables from the PDF file located at: {file_path} and export it in a user-friendly format (e.g., PDF, Word).