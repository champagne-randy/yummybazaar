// NG core modules
import { BrowserModule } 	from '@angular/platform-browser';
import { NgModule } 		from '@angular/core';

// Project modules
import { AppComponent } 	from './app.component';
import { Logger }			from './logger.service';

@NgModule({
	imports:      [ BrowserModule ],
	providers:    [ Logger ],
	declarations: [ AppComponent ],
	exports:      [ AppComponent ],
	bootstrap:    [ AppComponent ]
})
export class AppModule { }
