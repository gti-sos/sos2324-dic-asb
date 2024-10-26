const { test, expect, beforeAll, afterAll, beforeEach, afterEach } = require('@playwright/test');

let page;

beforeAll(async ({ browser }) => {
    page = await browser.newPage();
});

afterAll(async () => {
    await page.close();
});


test('Carga página principal', async () => {
    await page.goto('https://sos2324-jul-asb.ew.r.appspot.com//cars-by-motor');
    await expect(page).toHaveTitle('cars-by-motor');
    await expect(page).toHaveURL('https://sos2324-jul-asb.ew.r.appspot.com//cars-by-motor');
});

/*
test('tiene titulo Proyecto SOS2324-10', async () => {
    test.setTimeout(60000);
    await page.goto('https://sos2324-10.appspot.com');
    await expect(page).toHaveTitle(/Proyecto SOS2324-10/);
});
/*
test('more than 5 rows are loaded in the table', async () => {
    await page.goto('https://sos2324-10.appspot.com/cars-by-motor');
    // Espera a que la tabla se cargue y obtiene la cantidad de filas
    const loadDataButton = await page.$('button:has-text("Cargar datos")');
    /*if (loadDataButton) {
        await loadDataButton.click();
        await page.waitForTimeout(1000);
    }
    await page.waitForSelector('table');
    const rowCount = await page.$$eval('table tbody tr', rows => rows.length);

    // Verifica que la cantidad de filas sea mayor que 5
    expect(rowCount).toBeGreaterThan(5);
});
*/

// test('delete a row from the table', async ({ page }) => {
//     // Navega a la página
//     await page.goto('https://sos2324-10.appspot.com/cars-by-motor');

//     const loadDataButton = await page.$('button:has-text("Cargar datos")');
//     if (loadDataButton) {
//         await loadDataButton.click();
//         await page.waitForTimeout(1000);
//     }

//     // Espera a que la tabla se cargue completamente
//     await page.waitForSelector('tbody tr');

//     // Obtiene el último elemento de la tabla antes de la eliminación
//     const lastElementBeforeDelete = await page.$eval('tbody tr:last-child', row => row.textContent);

//     // Elimina un elemento de la tabla
//     await page.click('button:has-text("Eliminar")');

//     // Espera un momento para que se procese la eliminación y se actualice la tabla
//     await page.waitForTimeout(1000);

//     // Obtiene el último elemento de la tabla después de la eliminación
//     const lastElementAfterDelete = await page.$eval('tbody tr:last-child', row => row.textContent);

//     // Verifica que el último elemento de la tabla después de la eliminación sea diferente al último elemento antes de la eliminación
//     expect(lastElementAfterDelete).not.toEqual(lastElementBeforeDelete);
// });*/
