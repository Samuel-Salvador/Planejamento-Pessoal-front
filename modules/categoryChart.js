import {fetchUser} from './header.js';
import { transactionsArray } from './finance.js';

const chartContainer = document.querySelector(".container_chart");

Chart.defaults.color = '#EEEEEE';

let chartData;

export async function setUpChart(){
	chartData = {	type: 'doughnut',
			    	data: {
			      		labels: [],
			      		datasets: [{
			        		label: '',
			        		data: [],
			        		borderWidth: 1
			      		}]
			   			},
			    	options: {
			      		scales: {
			        		y: {
			          			beginAtZero: true,
								grid: {
									display: false
								},
								ticks:{
									display: false
								},
								border:{
									display: false
								}
			        		}
			      		},
						plugins: {
							title: {
								text: "Gastos por Categoria",
								display: true,
								align: 'center'
							},
							tooltip: {
								callbacks: {
									label: function (tooltipItem) {
												let value = tooltipItem.raw;
												return `${tooltipItem.dataset.label}: R$ ${value.toFixed(2)}`;
									}
								}
							},
							legend:{
								display: false
							}
			    		}
					}
	};
	await fetchUser();
	let seenCategoriesArray = [];
	let currentCategory;
	let newArray = [];
	let categoryQnt=0;
	
	for(let i=0;i<=categoryQnt;i++){
		transactionsArray.forEach((transaction)=>{
			if(seenCategoriesArray.some((category)=>category==transaction.category)){
				if(currentCategory == transaction.category){
					newArray.push(transaction.price);
				}
			}else{
				if(!currentCategory){
					seenCategoriesArray.push(transaction.category);
					currentCategory = transaction.category;
					newArray.push(transaction.price);
					categoryQnt++;
				}	
			}
		})
		
		if(newArray.length){
			chartData.data.labels.push(currentCategory);
			let reducedArray = newArray.reduce((acc,curr)=>curr+acc);
			chartData.data.datasets[0].data.push(reducedArray);
		}
		currentCategory = undefined;
		newArray = [];	
	}

	removeChart();
	const chart = document.createElement("canvas");
	chart.setAttribute("id","category_chart");
	chartContainer.appendChild(chart);
	new Chart(chart,chartData);
}

export function removeChart(){
	if(document.getElementById("category_chart")){
		chartContainer.removeChild(document.getElementById("category_chart"));
	}
}

