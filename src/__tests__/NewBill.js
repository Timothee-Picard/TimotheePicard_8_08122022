/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import store from "../__mocks__/store.js";
import {ROUTES} from "../constants/routes.js";
import {bills} from "../fixtures/bills.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Show title on", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {

        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document, onNavigate, store: bills, localStorage: window.localStorage
      })

      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })

    test("test handleChangeFile with store", () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })

      let fakeBills = store.bills()

      fakeBills.create = jest.fn(() => {
        return Promise.resolve(true)
      })
      const fakeEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "test"
        }
      }

      newBill.handleChangeFile(fakeEvent)

      expect(fakeBills.create).toHaveBeenCalled()
    })

    test("handleChangeFile with 404 bill", () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })

      let fakeBills = store.bills()

      fakeBills.create = jest.fn(() => {
        return Promise.reject("404")
      })

      newBill.handleChangeFile({
        preventDefault: jest.fn(),
        target: {
          value: "mon_fichier.png"
        }
      })

      expect(fakeBills.create).toHaveBeenCalled()
    })

    test("wrong file submit", async () => {

      document.body.innerHTML = NewBillUI()

      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })

      window.alert = jest.fn()

      newBill.fileName = 'mon_fichier.hhh';

      const inputName = screen.getByTestId('expense-name')
      fireEvent.change(inputName, {target: { value: "Name" }})

      const inputDate = screen.getByTestId('datepicker')
      fireEvent.change(inputDate, {target: {value: '2020-01-01'}})

      const inputAmount = screen.getByTestId('amount')
      fireEvent.change(inputAmount, {target: { value: "750" }})

      const inputVat = screen.getByTestId('vat')
      fireEvent.change(inputVat, {target: { value: "70" }})

      const inputPct = screen.getByTestId('pct')
      fireEvent.change(inputPct, {target: { value: "20" }})

      const form = screen.getByTestId('form-new-bill')
      fireEvent.submit(form)

      await waitFor(() => expect(window.alert).toHaveBeenCalled())
    })

    test("handleSubmit", async () => {

      document.body.innerHTML = NewBillUI()

      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })

      window.alert = jest.fn()
      const handleSubmit = jest.fn(newBill.handleSubmit)

      const inputType = screen.getByTestId('expense-type')
      fireEvent.change(inputType, { target: { value: "Transports" } })

      const inputName = screen.getByTestId('expense-name')
      fireEvent.change(inputName, {target: { value: "Name" }})

      const inputDate = screen.getByTestId('datepicker')
      fireEvent.change(inputDate, {target: {value: '2020-01-01'}})

      const inputAmount = screen.getByTestId('amount')
      fireEvent.change(inputAmount, {target: { value: "750" }})

      const inputVat = screen.getByTestId('vat')
      fireEvent.change(inputVat, {target: { value: "70" }})

      const inputPct = screen.getByTestId('pct')
      fireEvent.change(inputPct, {target: { value: "20" }})

      const inputComment = screen.getByTestId('commentary')
      fireEvent.change(inputComment, {target: { value: "Commentaire" }})

      const inputFile = screen.getByTestId('file')
      newBill.fileName = 'mon_fichier.jpg';

      const form = screen.getByTestId('form-new-bill')
      fireEvent.submit(form)

      expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
    })
  })
})
