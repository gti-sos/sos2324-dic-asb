<script>
    import Header from "./Header.svelte";
    import Footer from "./Footer.svelte";
    import { Styles } from '@sveltestrap/sveltestrap';
</script>

<style>
    h1 {
        height: 100%;
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        
    }
</style>

<Header/>
<h1>SOS2324-DIC-ASB</h1>
<hr>
<slot> </slot>
<hr>

<Footer/>
