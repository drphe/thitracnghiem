Attribute VB_Name = "XLXtoJSON"
Sub CreateQuiz()
    Dim rng As Range
    Dim WorkRng As Range
    Dim json As String
    Dim row, col As Integer
    json = "{"
    row = 1
    col = 0
    num = 0
    On Error Resume Next
    Set WorkRng = Application.Selection
    Set WorkRng = Application.InputBox("Select range", "Select range", WorkRng.Address, Type:=8)
    If Err Then Exit Sub
    If WorkRng.Rows.Count < 100000 Then
        For Each rng In WorkRng
            col = col + 1
            If col > 3 Then
                col = 1
                row = row + 1
            End If
        If (col = 1 And IsNumeric(rng.Value) And Not IsEmpty(rng.Value)) Then
            row = 1
            num = num + 1
            If num > 1 Then json = Left(json, Len(json) - 1) & "},"
            End If
        If row = 1 Then
            If col = 1 Then json = json & """" & Trim(num) & """:{"
            If col = 2 Then json = json & """Q"":""" & Trim(rng.Value) & ""","
            If col = 3 Then json = json & """A"":""" & Trim(rng.Value) & ""","
        Else
            If col = 2 Then
                json = json & """" & (row - 1) & """:""" & Trim(rng.Value) & ""","
            End If
        End If
    Next

    Else
        MsgBox "Vung chon qua lon!", vbInformation, "Failed!"
    End If
    json = Left(json, Len(json) - 1) & "}}"
        Cells(1, 1).WrapText = False
    Cells(1, 1).Value = json
        ' Get the active cell
    Dim cell As Range
    Set cell = ActiveSheet.Cells(1, 1)

    ' Copy the cell's value to the clipboard
    cell.Copy

    MsgBox "OK"
End Sub

