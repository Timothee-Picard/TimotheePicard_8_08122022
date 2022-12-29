/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import '@testing-library/jest-dom/extend-expect'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import store from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.className).toBe("active-icon")

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

// test d'intégration GET

describe("Given I am a user connected as Admin", () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })

    window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
    );
  });
  describe("When I navigate to Dashboard", () => {
    test('No bills displayed when give empty array', () => {
      document.body.innerHTML = BillsUI({data: []});
      const eyeIcon = screen.queryByTestId('icon-eye');
      expect(eyeIcon).toBeNull();
    })

    test("Then bill icon mail in vertical layout", async () => {
      document.body.innerHTML = BillsUI({data: []});
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).toBeTruthy()
    })
  })

  describe("Events", () => {
    test("Get bills with mocked store", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      document.body.innerHTML = BillsUI({data: bills});
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const billsList = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })
      billsList.getBills()
    })

    test("Go to new Bill", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      document.body.innerHTML = BillsUI({data: bills});
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const billsList = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const btnNewBill = screen.getByTestId('btn-new-bill')

      // const tbody = screen.getByTestId('tbody')
      userEvent.click(btnNewBill)
      await waitFor(() => screen.getByText('Envoyer une note de frais'))
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })

    test('Show modal when click on eye icon', async () => {
      document.body.innerHTML = BillsUI({data: bills});
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const billsList = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })
      expect(screen.queryByAltText("Bill")).toBeNull()
      const eyeIcon = screen.queryAllByTestId('icon-eye')[0]

      jQuery.prototype.modal = jest.fn()
      fireEvent.click(eyeIcon)

      expect(jQuery.prototype.modal).toHaveBeenCalled()
      expect(screen.queryByAltText("Bill")).toBeTruthy()
    })

    test('return no bills if no store', async () => {
      const billsList = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      const emptyBills = billsList.getBills()
      expect(emptyBills).toBeUndefined()
    })
  })

  describe("Load Ui", () => {
    test('Display loader', () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText('Loading...')).toBeTruthy();
    });

    test('Display error', () => {
      document.body.innerHTML = BillsUI({ error: 'i am an arror' });
      expect(screen.getAllByText('Erreur')).toBeTruthy();
    });
  })
})
